from sqlalchemy import text
from database import engine


def queue_sms(analysis_id, phone_number, message):

    query = text("""
        INSERT INTO sms_queue
        (
            analysis_id,
            phone_number,
            message,
            status
        )

        VALUES
        (
            :analysis_id,
            :phone_number,
            :message,
            'PENDING'
        )
    """)

    with engine.begin() as conn:

        conn.execute(
            query,
            {
                "analysis_id": analysis_id,
                "phone_number": phone_number,
                "message": message,
            },
        )

    print(f"[SMS] Queued for {phone_number} (analysis_id={analysis_id}).")


# ---------- TEST ----------
if __name__ == "__main__":

    queue_sms(
        analysis_id=1,
        phone_number="09171234567",
        message="Test SMS from GrainSense AI.",
    )
