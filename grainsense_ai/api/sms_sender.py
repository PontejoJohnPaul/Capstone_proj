"""
sms_sender.py

Reads PENDING rows from sms_queue, sends them through sms_gateway
(Semaphore), and records the outcome in both sms_queue (status/sent_at)
and sms_logs (audit trail).

This is called every cycle from ai_engine.py -- no manual triggering
needed once the systemd service is running.
"""

from sqlalchemy import text
from database import engine


def send_pending_sms(limit=20):

    select_query = text("""
        SELECT sms_id, analysis_id, phone_number, message
        FROM sms_queue
        WHERE status = 'PENDING'
        ORDER BY sms_id ASC
        LIMIT :limit
    """)

    with engine.begin() as conn:
        pending = conn.execute(select_query, {"limit": limit}).mappings().all()

    if not pending:
        return

    # Imported here (not at module top) to avoid a circular import with
    # sms_gateway during testing/standalone runs.
    from api.sms_gateway import send_sms

    for row in pending:

        result = send_sms(row["phone_number"], row["message"])

        new_status = "SENT" if result["success"] else "FAILED"
        log_status = "SUCCESS" if result["success"] else "FAILED"

        with engine.begin() as conn:

            conn.execute(
                text("""
                    UPDATE sms_queue
                    SET status = :status,
                        sent_at = CASE WHEN :status = 'SENT' THEN NOW() ELSE sent_at END
                    WHERE sms_id = :sms_id
                """),
                {"status": new_status, "sms_id": row["sms_id"]},
            )

            conn.execute(
                text("""
                    INSERT INTO sms_logs (phone, message, sms_status, sent_at)
                    VALUES (:phone, :message, :sms_status, NOW())
                """),
                {
                    "phone": row["phone_number"],
                    "message": row["message"],
                    "sms_status": log_status,
                },
            )

        print(f"[SMS] sms_id={row['sms_id']} -> {new_status} ({result['response']})")


if __name__ == "__main__":
    send_pending_sms()
