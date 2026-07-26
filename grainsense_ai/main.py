"""
main.py

FastAPI app for GrainSense AI.

IMPORTANT: The automatic Real-time AI pipeline does NOT depend on this
API being called by anything -- that work is done by ai_engine.py
(per-sensor polling loop), which runs as its own systemd service.

This FastAPI app exists for:
  - /health          -> quick uptime check (e.g. for monitoring/demo)
  - /sensors/active   -> list of currently active moisture sensors/batches
  - /predict/{sensor_id} -> manually re-run the real pipeline for one
                            sensor (useful for testing/demo without
                            waiting for the next poll cycle)

Runs as its own systemd service (see deploy/grainsense-fastapi.service)
so it is reachable over HTTP without ever opening a terminal manually.
"""

from fastapi import FastAPI, HTTPException

from api.database_reader import get_active_moisture_sensors
from api.save_prediction import save_prediction_for_sensor

app = FastAPI(title="GrainSense AI")


@app.get("/")
def home():
    return {"message": "GrainSense AI is running"}


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/sensors/active")
def active_sensors():
    return {"sensors": get_active_moisture_sensors()}


@app.post("/predict/{sensor_id}")
def predict_now(sensor_id: int):
    """
    Manually triggers the real-time pipeline (Random Forest -> Gemini if
    WARNING/DANGER -> save -> SMS queue if WARNING/DANGER) for one
    sensor, instead of waiting for the next automatic poll cycle.
    """

    result = save_prediction_for_sensor(sensor_id)

    if result is None:
        raise HTTPException(
            status_code=400,
            detail="Not enough data to predict yet (check DHT sensors are online "
                   "and this sensor has an ACTIVE batch with a moisture reading).",
        )

    return result
