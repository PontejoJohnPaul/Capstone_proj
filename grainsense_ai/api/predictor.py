import joblib
import numpy as np
import pandas as pd

from api.database_reader import (
    get_moisture_sensor_reading,
    get_warehouse_dht_average,
    get_batch_for_sensor,
)

# Load trained model (RF trained on: temperature, humidity, moisture -> risk_level)
model = joblib.load("model/random_forest.pkl")
encoder = joblib.load("model/label_encoder.pkl")

STATUS_MAP = {
    "LOW": "SAFE",
    "MEDIUM": "WARNING",
    "HIGH": "DANGER",
}


def predict_for_sensor(sensor_id):
    """
    Runs a Random Forest prediction for ONE moisture sensor (i.e. ONE
    storage batch), instead of averaging every sensor in the warehouse
    together.

    Combines:
      - this sensor's own latest moisture reading
      - the warehouse's current DHT average (temperature/humidity)

    Returns None if there isn't enough data yet to predict (e.g. no DHT
    sensors online, or this MS has never reported).
    """

    moisture_reading = get_moisture_sensor_reading(sensor_id)

    if moisture_reading is None or moisture_reading["moisture"] is None:
        return None

    dht = get_warehouse_dht_average()

    if dht["temperature"] is None or dht["humidity"] is None:
        # No DHT context available yet -- skip rather than guess.
        return None

    batch = get_batch_for_sensor(sensor_id)

    if batch is None:
        # Sensor has no ACTIVE batch (shouldn't normally happen since the
        # engine only polls sensors returned by get_active_moisture_sensors()).
        return None

    features = pd.DataFrame([{
        "temperature": dht["temperature"],
        "humidity": dht["humidity"],
        "moisture": moisture_reading["moisture"],
    }])

    prediction = model.predict(features)
    risk = encoder.inverse_transform(prediction)[0]

    probabilities = model.predict_proba(features)
    confidence = round(np.max(probabilities) * 100, 2)

    status = STATUS_MAP[risk]

    return {
        "sensor_id": sensor_id,
        "batch_id": batch["batch_id"],
        "farmer_id": batch["farmer_id"],
        "temperature": dht["temperature"],
        "humidity": dht["humidity"],
        "moisture": moisture_reading["moisture"],
        "reading_updated_at": moisture_reading["updated_at"],
        "risk": risk,
        "status": status,
        "confidence": confidence,
    }


if __name__ == "__main__":

    from api.database_reader import get_active_moisture_sensors

    for s in get_active_moisture_sensors():
        result = predict_for_sensor(s["sensor_id"])
        print(f"Sensor {s['sensor_code']} (batch {s['batch_id']}):", result)
