"""
historical_ai.py

HISTORICAL AI -- separate from Real-time AI.

Runs only for batches that have just finished (status='FINISHED' in
`batches`, via disable_moisture_sensor.php) with damaged/infested
sacks > 0. If infested = 0, no AI analysis is generated (handled
automatically since get_batches_needing_historical_analysis() only
returns rows where damaged_sacks > 0).

For each such batch:
  1. Pull ALL historical sensor readings collected while that Moisture
     Sensor was active (moisture) plus warehouse DHT history over the
     same window (temperature/humidity context).
  2. Send the full history to Gemini for Root Cause Analysis.
  3. Save the result into batch_results.notes.

IMPORTANT: This NEVER queues an SMS. Historical AI only creates reports
(per the SMS RULES in the project spec).
"""

from sqlalchemy import text
from database import engine

from api.database_reader import (
    get_batches_needing_historical_analysis,
    get_batch_sensor_history,
    get_warehouse_dht_history,
)
from api.gemini_generator import generate_root_cause_analysis


def _summarize_readings(df, label):

    if df.empty:
        return f"{label}: No data recorded."

    lines = [f"{label} ({len(df)} readings):"]

    for col in ["temperature", "humidity", "moisture"]:
        if col in df.columns and df[col].notna().any():
            series = df[col].dropna()
            lines.append(
                f"  {col}: min={series.min():.1f}, max={series.max():.1f}, avg={series.mean():.1f}"
            )

    return "\n".join(lines)


def run_historical_analysis(batch):
    """
    batch: one row from get_batches_needing_historical_analysis()
    """

    start_time = batch["batch_started_at"]
    end_time = batch["finished_at"]

    moisture_history = get_batch_sensor_history(batch["sensor_id"], start_time, end_time)
    dht_history = get_warehouse_dht_history(start_time, end_time)

    duration_days = None
    if start_time and end_time:
        duration_days = round((end_time - start_time).total_seconds() / 86400, 1)

    batch_summary = f"""
Batch ID: {batch['batch_id']}
Total Sacks: {batch['total_sacks']}
Healthy Sacks: {batch['healthy_sacks']}
Infested/Damaged Sacks: {batch['damaged_sacks']}
Storage Duration: {duration_days} days
"""

    readings_summary = (
        _summarize_readings(moisture_history, "Moisture Sensor Readings")
        + "\n\n"
        + _summarize_readings(dht_history, "Warehouse Temperature/Humidity Readings")
    )

    analysis = generate_root_cause_analysis(batch_summary, readings_summary)

    notes = (
        f"LIKELY PEST(S): {analysis['likely_pests']}\n\n"
        f"ROOT CAUSE: {analysis['root_cause']}\n\n"
        f"CONTRIBUTING CONDITIONS: {analysis['contributing_conditions']}\n\n"
        f"RECOMMENDATION: {analysis['recommendation']}"
    )

    with engine.begin() as conn:
        conn.execute(
            text("""
                UPDATE batch_results
                SET notes = :notes
                WHERE result_id = :result_id
            """),
            {"notes": notes, "result_id": batch["result_id"]},
        )

    print(f"[Historical AI] Root cause analysis saved for batch_id={batch['batch_id']}.")


def process_pending_historical_analyses():

    batches = get_batches_needing_historical_analysis()

    for batch in batches:
        try:
            run_historical_analysis(batch)
        except Exception as e:
            print(f"[Historical AI] Failed for batch_id={batch['batch_id']}: {e}")


if __name__ == "__main__":
    process_pending_historical_analyses()
