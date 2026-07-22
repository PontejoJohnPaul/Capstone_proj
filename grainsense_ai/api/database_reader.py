"""
database_reader.py

IMPORTANT ARCHITECTURE NOTE
----------------------------
This module used to average ALL sensors together (get_average_values()).
That is WRONG for this system, because:

- Every Moisture Sensor (MS) represents ONE storage batch.
- DHT sensors are warehouse-wide (not batch-specific).

So predictions must be made PER MOISTURE SENSOR (i.e. per batch), using:
  - that sensor's own latest moisture reading
  - the warehouse's current DHT average (temperature/humidity) as context

This file now exposes per-sensor / per-batch queries instead of a single
pooled average.
"""

import pandas as pd
from database import engine


def get_active_moisture_sensors():
    """
    Returns all MOISTURE sensors that are currently enabled, not removed,
    AND have an ACTIVE batch. These are the sensors the AI engine should
    poll every cycle.
    """

    query = """
        SELECT
            s.sensor_id,
            s.sensor_code,
            s.sensor_name,
            b.batch_id,
            b.farmer_id,
            b.total_sacks
        FROM sensors s
        INNER JOIN batches b
            ON b.sensor_id = s.sensor_id
            AND b.status = 'ACTIVE'
        WHERE s.sensor_type = 'MOISTURE'
        AND s.enabled = 1
        AND s.removed = 0
        ORDER BY s.sensor_id;
    """

    df = pd.read_sql(query, engine)

    return df.to_dict(orient="records")


def get_moisture_sensor_reading(sensor_id):
    """
    Latest moisture value + timestamp for ONE moisture sensor.
    Used by the AI engine to detect "is this a new reading?".
    """

    query = """
        SELECT
            sensor_id,
            moisture,
            updated_at
        FROM sensor_latest
        WHERE sensor_id = %(sensor_id)s;
    """

    df = pd.read_sql(query, engine, params={"sensor_id": sensor_id})

    if df.empty:
        return None

    row = df.iloc[0]

    return {
        "sensor_id": int(row["sensor_id"]),
        "moisture": None if pd.isna(row["moisture"]) else float(row["moisture"]),
        "updated_at": row["updated_at"],
    }


def get_warehouse_dht_average():
    """
    Average temperature/humidity across all currently ONLINE, enabled DHT
    sensors. DHT sensors are not tied to a batch, so this represents the
    shared warehouse "climate context" used alongside each MS reading.
    """

    query = """
        SELECT
            sl.temperature,
            sl.humidity
        FROM sensors s
        INNER JOIN sensor_latest sl
            ON sl.sensor_id = s.sensor_id
        WHERE s.sensor_type = 'DHT'
        AND s.enabled = 1
        AND s.removed = 0;
    """

    df = pd.read_sql(query, engine)

    avg_temp = df["temperature"].dropna().mean()
    avg_hum = df["humidity"].dropna().mean()

    return {
        "temperature": round(avg_temp, 2) if pd.notna(avg_temp) else None,
        "humidity": round(avg_hum, 2) if pd.notna(avg_hum) else None,
    }


def get_batch_for_sensor(sensor_id):
    """
    The currently ACTIVE batch tied to a moisture sensor.
    """

    query = """
        SELECT
            batch_id,
            farmer_id,
            sensor_id,
            total_sacks,
            status,
            created_at
        FROM batches
        WHERE sensor_id = %(sensor_id)s
        AND status = 'ACTIVE'
        ORDER BY batch_id DESC
        LIMIT 1;
    """

    df = pd.read_sql(query, engine, params={"sensor_id": sensor_id})

    if df.empty:
        return None

    return df.iloc[0].to_dict()


def get_farmer_phone(farmer_id):
    """
    farmer_id -> farmer_profile.user_id -> users.phone
    """

    query = """
        SELECT
            u.phone
        FROM farmer_profile fp
        INNER JOIN users u
            ON u.user_id = fp.user_id
        WHERE fp.farmer_id = %(farmer_id)s
        LIMIT 1;
    """

    df = pd.read_sql(query, engine, params={"farmer_id": farmer_id})

    if df.empty or pd.isna(df.iloc[0]["phone"]):
        return None

    return df.iloc[0]["phone"]


def get_latest_reading_id(sensor_id):
    """
    Most recent sensor_readings.reading_id for this sensor, so ai_analysis
    can be linked back to the exact reading that triggered it.
    """

    query = """
        SELECT reading_id
        FROM sensor_readings
        WHERE sensor_id = %(sensor_id)s
        ORDER BY reading_id DESC
        LIMIT 1;
    """

    df = pd.read_sql(query, engine, params={"sensor_id": sensor_id})

    if df.empty:
        return None

    return int(df.iloc[0]["reading_id"])


def get_batches_needing_historical_analysis():
    """
    FINISHED batches that had infested (damaged) sacks, but do not yet
    have a Root Cause Analysis saved (batch_results.notes IS NULL).
    """

    query = """
        SELECT
            br.result_id,
            br.batch_id,
            br.healthy_sacks,
            br.damaged_sacks,
            b.sensor_id,
            b.farmer_id,
            b.total_sacks,
            b.created_at AS batch_started_at,
            br.finished_at
        FROM batch_results br
        INNER JOIN batches b
            ON b.batch_id = br.batch_id
        WHERE br.damaged_sacks > 0
        AND br.notes IS NULL;
    """

    df = pd.read_sql(query, engine)

    return df.to_dict(orient="records")


def get_batch_sensor_history(sensor_id, start_time, end_time):
    """
    All moisture readings for a specific sensor during the batch's active
    lifetime (used for Historical AI / Root Cause Analysis).
    """

    query = """
        SELECT
            temperature,
            humidity,
            moisture,
            created_at
        FROM sensor_readings
        WHERE sensor_id = %(sensor_id)s
        AND created_at BETWEEN %(start_time)s AND %(end_time)s
        ORDER BY created_at ASC;
    """

    df = pd.read_sql(
        query,
        engine,
        params={
            "sensor_id": sensor_id,
            "start_time": start_time,
            "end_time": end_time,
        },
    )

    return df


def get_warehouse_dht_history(start_time, end_time):
    """
    Warehouse DHT (temperature/humidity) readings during a batch's active
    lifetime, used as environmental context for Historical AI.
    """

    query = """
        SELECT
            sr.temperature,
            sr.humidity,
            sr.created_at
        FROM sensor_readings sr
        INNER JOIN sensors s
            ON s.sensor_id = sr.sensor_id
        WHERE s.sensor_type = 'DHT'
        AND sr.created_at BETWEEN %(start_time)s AND %(end_time)s
        ORDER BY sr.created_at ASC;
    """

    df = pd.read_sql(
        query,
        engine,
        params={"start_time": start_time, "end_time": end_time},
    )

    return df


if __name__ == "__main__":

    print("Active moisture sensors:")
    print(get_active_moisture_sensors())

    print()
    print("Warehouse DHT average:")
    print(get_warehouse_dht_average())
