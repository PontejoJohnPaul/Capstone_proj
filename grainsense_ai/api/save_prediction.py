from sqlalchemy import text

from database import engine

from api.predictor import predict_for_sensor
from api.gemini_generator import generate_prediction
from api.database_reader import get_latest_reading_id, get_farmer_phone
from api.sms_manager import queue_sms


def save_prediction_for_sensor(sensor_id):
    """
    Runs the full Real-time AI pipeline for ONE moisture sensor:

      1. Random Forest prediction (per-sensor, not pooled).
      2. If SAFE -> save prediction only. No Gemini call. No SMS.
      3. If WARNING/DANGER -> ask Gemini for pest/cause/recommendation,
         save to ai_analysis, and queue an SMS to the batch's farmer.
    """

    rf = predict_for_sensor(sensor_id)

    if rf is None:
        # Not enough data yet (e.g. DHT sensors offline, or MS hasn't
        # reported a moisture value yet). Skip this cycle silently.
        return None

    status = rf["status"]  # SAFE / WARNING / DANGER
    reading_id = get_latest_reading_id(sensor_id)

    if status == "SAFE":

        ai = {
            "predicted_pest": "None",
            "possible_cause": "None",
            "recommendation": "Storage condition is safe. Continue regular monitoring.",
        }

    else:

        report = f"""
Batch ID : {rf['batch_id']}
Temperature : {rf['temperature']}°C
Humidity : {rf['humidity']}%
Moisture : {rf['moisture']}%
"""

        ai = generate_prediction(report, rf["risk"])

    # -------------------------
    # Save to ai_analysis
    # -------------------------

    insert_query = text("""
        INSERT INTO ai_analysis
        (
            reading_id,
            batch_id,
            status,
            prediction,
            confidence,
            predicted_pest,
            possible_cause,
            recommendation,
            model_version,
            created_at
        )
        VALUES
        (
            :reading_id,
            :batch_id,
            :status,
            :prediction,
            :confidence,
            :predicted_pest,
            :possible_cause,
            :recommendation,
            :model_version,
            NOW()
        )
    """)

    with engine.begin() as conn:

        result = conn.execute(
            insert_query,
            {
                "reading_id": reading_id,
                "batch_id": rf["batch_id"],
                "status": status,
                "prediction": rf["risk"],
                "confidence": rf["confidence"],
                "predicted_pest": ai["predicted_pest"],
                "possible_cause": ai["possible_cause"],
                "recommendation": ai["recommendation"],
                "model_version": "RF_v1 + Gemini",
            },
        )

        analysis_id = result.lastrowid

    print()
    print("============================")
    print(f"Prediction saved | sensor={sensor_id} batch={rf['batch_id']} status={status}")
    print("============================")
    print(ai)

    # -------------------------
    # SMS -- ONLY for WARNING/DANGER, never for SAFE
    # -------------------------

    if status != "SAFE":
        _queue_sms_for_batch(rf, ai, analysis_id)

    return {
        "analysis_id": analysis_id,
        "status": status,
        "rf": rf,
        "ai": ai,
    }


def _queue_sms_for_batch(rf, ai, analysis_id):

    phone = get_farmer_phone(rf["farmer_id"])

    if not phone:
        print(f"[SMS] No phone number on file for farmer_id={rf['farmer_id']}, skipping SMS.")
        return

    message = (
        f"[GrainSense Alert - {rf['status']}] "
        f"Batch {rf['batch_id']}: Possible {ai['predicted_pest']} risk detected. "
        f"{ai['recommendation']}"
    )

    # SMS providers (Semaphore) have a practical length limit -- trim
    # long Gemini recommendations rather than sending a broken message.
    if len(message) > 300:
        message = message[:297] + "..."

    queue_sms(
        analysis_id=analysis_id,
        phone_number=phone,
        message=message,
    )


if __name__ == "__main__":

    from api.database_reader import get_active_moisture_sensors

    for s in get_active_moisture_sensors():
        save_prediction_for_sensor(s["sensor_id"])
