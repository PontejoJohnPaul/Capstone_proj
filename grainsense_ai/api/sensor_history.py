"""
sensor_history.py -- DEPRECATED, DO NOT CALL FROM ai_engine.py

This file used to bulk-copy every row of `sensor_latest` into
`sensor_readings` on a timer. That is now REDUNDANT and CAUSES DUPLICATE
HISTORY DATA, because api/save_readings.php on the PHP side already
writes every individual reading straight into `sensor_readings` (with its
own "Smart Save" deduplication logic) at the moment the ESP32 pushes data.

Kept in the repo only so the history of the change is documented for the
capstone write-up. It is intentionally not imported anywhere.
"""

raise ImportError(
    "sensor_history.py is deprecated. sensor_readings is now populated "
    "directly by api/save_readings.php on the PHP side. Do not import "
    "or call this module."
)
