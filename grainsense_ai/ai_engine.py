"""
ai_engine.py

GrainSense AI Engine -- the single background process that:

  1. REAL-TIME AI: polls every ACTIVE moisture sensor (i.e. every ongoing
     storage batch) individually, every POLL_INTERVAL_SECONDS. When a
     sensor's latest moisture reading changes, it runs a fresh Random
     Forest prediction for THAT sensor/batch only (never a pooled
     average across all sensors).

  2. SMS DISPATCH: every cycle, sends any PENDING rows in sms_queue via
     the Semaphore gateway.

  3. HISTORICAL AI: every HISTORICAL_CHECK_INTERVAL_CYCLES cycles, checks
     for batches that just finished with infested sacks > 0 and runs the
     Root Cause Analysis (Gemini) for them.

Meant to run continuously as a systemd service on the VPS (see
deploy/grainsense-engine.service) -- no manual command entry required
after the server boots.
"""

import time
import traceback

from api.database_reader import get_active_moisture_sensors, get_moisture_sensor_reading
from api.save_prediction import save_prediction_for_sensor
from api.sms_sender import send_pending_sms
from api.historical_ai import process_pending_historical_analyses

POLL_INTERVAL_SECONDS = 10
HISTORICAL_CHECK_INTERVAL_CYCLES = 6  # every ~60s with a 10s poll interval

# In-memory "have we already reacted to this reading?" tracker.
# Keyed by sensor_id -> last seen updated_at timestamp.
# Resets on service restart, which is fine: the next real change in
# sensor_latest will simply be picked up on the following cycle.
last_seen = {}


def run_cycle():

    sensors = get_active_moisture_sensors()

    for sensor in sensors:

        sensor_id = sensor["sensor_id"]

        reading = get_moisture_sensor_reading(sensor_id)

        if reading is None or reading["updated_at"] is None:
            continue

        if last_seen.get(sensor_id) != reading["updated_at"]:

            print(f"[AI Engine] New reading on sensor_id={sensor_id} (batch {sensor['batch_id']})")

            try:
                save_prediction_for_sensor(sensor_id)
            except Exception:
                print(f"[AI Engine] Prediction failed for sensor_id={sensor_id}:")
                traceback.print_exc()

            last_seen[sensor_id] = reading["updated_at"]

    # Dispatch any queued SMS every cycle.
    try:
        send_pending_sms()
    except Exception:
        print("[AI Engine] SMS dispatch failed:")
        traceback.print_exc()


def main():

    print("=" * 50)
    print(" GrainSense AI Engine Started")
    print("=" * 50)

    cycle_count = 0

    while True:

        try:
            run_cycle()

            cycle_count += 1

            if cycle_count % HISTORICAL_CHECK_INTERVAL_CYCLES == 0:
                try:
                    process_pending_historical_analyses()
                except Exception:
                    print("[AI Engine] Historical AI check failed:")
                    traceback.print_exc()

        except Exception:
            print("[AI Engine] Cycle error:")
            traceback.print_exc()

        time.sleep(POLL_INTERVAL_SECONDS)


if __name__ == "__main__":
    main()
