# GrainSense AI — Changes Made

## 1. Per-sensor / per-batch prediction (was: pooled average of ALL sensors)

**Before:** `get_average_values()` averaged temperature/humidity/moisture
across every sensor in the warehouse into one number, and `ai_engine.py`
watched a single `MAX(updated_at)` across the entire `sensor_latest`
table. This meant one prediction for the whole warehouse, with no way to
know which batch/farmer it belonged to.

**After:**
- `api/database_reader.py` — `get_active_moisture_sensors()`,
  `get_moisture_sensor_reading(sensor_id)`,
  `get_warehouse_dht_average()`, `get_batch_for_sensor(sensor_id)`,
  `get_farmer_phone(farmer_id)`.
- `api/predictor.py` — `predict_for_sensor(sensor_id)` combines that
  one MS's moisture reading with the current warehouse DHT average, and
  returns the batch_id/farmer_id it belongs to.
- `ai_engine.py` — loops over every ACTIVE moisture sensor individually
  every 10s, and only re-predicts a sensor when ITS OWN
  `sensor_latest.updated_at` has changed.

## 2. SAFE now correctly skips Gemini (was: Gemini called every time)

`api/save_prediction.py` now only calls `generate_prediction()` (Gemini)
when status is WARNING/DANGER. SAFE predictions are saved with a fixed
"continue regular monitoring" message and never reach Gemini or SMS —
matching the spec ("If SAFE: Save prediction only. No SMS.").

## 3. Removed hardcoded pest/recommendation strings

`api/predictor.py` used to hardcode `pest = "Rice Weevil"` and static
recommendation text per risk level. That's gone — Gemini
(`generate_prediction`) now generates the pest/cause/recommendation
dynamically, as required by the spec.

## 4. SMS is now actually wired up (was: `queue_sms()` existed but was never called)

`api/save_prediction.py` now calls `queue_sms()` after a WARNING/DANGER
prediction, using the farmer's phone number resolved via
`batches.farmer_id → farmer_profile → users.phone`. Two new files
dispatch the queue:
- `api/sms_gateway.py` — Semaphore API wrapper.
- `api/sms_sender.py` — reads PENDING rows from `sms_queue`, sends them,
  updates `sms_queue.status` and writes to `sms_logs`. Called every
  cycle from `ai_engine.py`.

## 5. `sensor_id`/`batch_id`/`reading_id` now saved to `ai_analysis`

The INSERT in `save_prediction.py` now populates `reading_id` and
`batch_id` (columns that already existed in your schema but were never
written to).

## 6. Removed duplicate history writing

`api/sensor_history.py` used to bulk-copy all of `sensor_latest` into
`sensor_readings` on a timer. This duplicated what
`api/save_readings.php` (PHP side) already does correctly with its own
"Smart Save" deduplication. The Python version is now a deprecated stub
that raises an error if accidentally imported, and `ai_engine.py` no
longer calls it.

## 7. New: Historical AI (Root Cause Analysis)

New file `api/historical_ai.py`:
- `get_batches_needing_historical_analysis()` (in `database_reader.py`)
  finds `batches` that are `FINISHED` with `damaged_sacks > 0` and no
  `batch_results.notes` yet.
- Pulls that batch's full moisture history + warehouse DHT history for
  the storage period.
- Sends it to Gemini via the new `generate_root_cause_analysis()`
  function in `gemini_generator.py`.
- Saves the result into `batch_results.notes`.
- **Never queues an SMS** — historical AI only produces reports, per
  spec.
- Checked automatically every ~60s from `ai_engine.py` (no separate
  service needed).

## 8. Fixed missing dependencies

`requirements.txt` was missing `google-genai` and `python-dotenv`, even
though `gemini_generator.py` imports both — the original code would
have crashed with `ModuleNotFoundError` if `pip install -r
requirements.txt` was the only setup step run. Both are now included.

## 9. `main.py` (FastAPI) repurposed

The old `/predict` endpoint called the raw model directly, bypassing
Gemini/DB/SMS entirely — completely disconnected from the real
pipeline. It's now a thin manual-testing/health-check API
(`/health`, `/sensors/active`, `POST /predict/{sensor_id}` which now
runs the *real* pipeline on demand). The automatic pipeline does not
depend on this API being called — `ai_engine.py` runs independently.

## 10. Deployment (VPS, no manual command entry)

Added `deploy/grainsense-fastapi.service`, `deploy/grainsense-engine.service`,
and `deploy/SETUP.md` — systemd services so both processes start on
boot and auto-restart on crash.

## What did NOT change

- `database.py` (connection logic — already fine)
- `train_model.py` / `model/random_forest.pkl` / `model/label_encoder.pkl`
  / `dataset/rice_pest_dataset.csv` (model itself is unaffected — only
  *how its inputs are gathered* changed)
- PHP side (`save_readings.php`, `enable_moisture_sensor.php`,
  `disable_moisture_sensor.php`, etc.) — all confirmed correct as-is
