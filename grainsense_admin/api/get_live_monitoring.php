<?php
/**
 * get_live_monitoring.php
 *
 * REST API endpoint only — NO HTML output.
 *
 * Joins `sensors` with `sensor_latest` and returns the latest reading of
 * every non-removed sensor as JSON. This is the ONLY endpoint that
 * monitoring.js should poll for live values.
 *
 * NOTE ON FILE LOCATION:
 * monitoring.js fetches this file from "api/get_live_monitoring.php"
 * (relative to monitoring.php). Place this file inside an "api" folder
 * next to monitoring.php.
 */

header("Content-Type: application/json");

include "../config/database.php";

//========================================
// STALENESS THRESHOLD
// sensor_latest gets overwritten (ON DUPLICATE KEY UPDATE)
// every time save_readings.php stores a new reading, and the
// firmware guarantees a save at least every 5 minutes even if
// the value hasn't changed (heartbeat). So if updated_at is
// older than this, the sensor stopped actually reporting
// (unplugged/disconnected) -- even though it's still enabled.
// 360s = 6 minutes gives a small buffer over the 5-min heartbeat.
// Keep this in sync with get_dashboard.php.
//========================================
$STALE_THRESHOLD_SECONDS = 360;

//========================================
// RISK STATUS (SAFE / WARNING / DANGER)
// Compares a reading against sensor_thresholds using three zones:
//   value < min or value > max  -> DANGER
//   min <= value <= safe        -> SAFE
//   safe < value <= max         -> WARNING
//========================================
function get_risk_status($value, $min, $safe, $max) {
    if ($value === null) return null;
    if ($value < $min || $value > $max) return "DANGER";
    if ($value <= $safe) return "SAFE";
    return "WARNING";
}

// Worst (highest-severity) status among the given values, ignoring nulls.
function worst_risk(...$statuses) {
    $rank = ["SAFE" => 0, "WARNING" => 1, "DANGER" => 2];
    $worst = null;
    foreach ($statuses as $s) {
        if ($s === null) continue;
        if ($worst === null || $rank[$s] > $rank[$worst]) $worst = $s;
    }
    return $worst;
}

$thresholdsResult = mysqli_query($conn, "SELECT * FROM sensor_thresholds LIMIT 1");
$thresholds = $thresholdsResult ? mysqli_fetch_assoc($thresholdsResult) : null;

// Note: We intentionally do NOT filter by enabled = 1 here.
// We still exclude removed sensors, but we keep disabled sensors in the
// response (with enabled = 0) so the front-end can show a "Disabled"
// state instead of the card simply going stale/silent.
//
// FIX: added TIMESTAMPDIFF(SECOND, sl.updated_at, NOW()) computed
// server-side in SQL, so freshness is judged using the DB's own
// clock (no PHP-vs-MySQL timezone mismatch risk).
$sql = "
    SELECT
        s.sensor_id AS sensor_id,
        s.sensor_code,
        s.sensor_name,
        s.sensor_type,
        s.gpio_pin,
        s.enabled,
        sl.temperature,
        sl.humidity,
        sl.moisture,
        sl.updated_at,
        TIMESTAMPDIFF(SECOND, sl.updated_at, NOW()) AS seconds_since_update
    FROM sensors s
    LEFT JOIN sensor_latest sl ON sl.sensor_id = s.sensor_id
    WHERE s.removed = 0
    ORDER BY s.sensor_type, s.sensor_code
";

$result = mysqli_query($conn, $sql);

if (!$result) {
    echo json_encode([
        "success" => false,
        "message" => "Database query failed: " . mysqli_error($conn)
    ]);
    exit();
}

$sensors = [];

while ($row = mysqli_fetch_assoc($result)) {

    $isEnabled = ((int) $row["enabled"]) === 1;

    $hasReading = $row["updated_at"] !== null;

    $secondsSince = $row["seconds_since_update"] !== null
        ? (int) $row["seconds_since_update"]
        : null;

    $isFresh = $hasReading && $secondsSince !== null && $secondsSince <= $STALE_THRESHOLD_SECONDS;

    //========================================
    // Explicit status, computed once here,
    // so the front-end never has to guess:
    // - "disabled"  -> turned off on purpose
    // - "no_signal" -> enabled, but nothing fresh
    //                  (disconnected / never reported)
    // - "online"    -> enabled AND has a fresh reading
    //========================================
    if (!$isEnabled) {
        $status = "disabled";
    } elseif ($isFresh) {
        $status = "online";
    } else {
        $status = "no_signal";
    }

    // Only compute risk status off a live, trustworthy reading — same
    // gating already used below for exposing temperature/humidity/moisture.
    $temperatureStatus = null;
    $humidityStatus = null;
    $moistureStatus = null;

    if ($status === "online" && $thresholds) {
        if ($row["sensor_type"] === "DHT") {
            $temperatureStatus = get_risk_status(
                $row["temperature"] !== null ? (float) $row["temperature"] : null,
                $thresholds["temperature_min"],
                $thresholds["temperature_safe"],
                $thresholds["temperature_max"]
            );
            $humidityStatus = get_risk_status(
                $row["humidity"] !== null ? (float) $row["humidity"] : null,
                $thresholds["humidity_min"],
                $thresholds["humidity_safe"],
                $thresholds["humidity_max"]
            );
        } else {
            $moistureStatus = get_risk_status(
                $row["moisture"] !== null ? (float) $row["moisture"] : null,
                $thresholds["moisture_min"],
                $thresholds["moisture_safe"],
                $thresholds["moisture_max"]
            );
        }
    }

    $riskStatus = worst_risk($temperatureStatus, $humidityStatus, $moistureStatus);

    $sensors[] = [
        "sensor_id"   => (int) $row["sensor_id"],
        "sensor_code" => $row["sensor_code"],
        "sensor_name" => $row["sensor_name"],
        "sensor_type" => $row["sensor_type"],
        "gpio_pin"    => $row["gpio_pin"],
        "enabled"     => $isEnabled ? 1 : 0,
        "status"      => $status,

        // FIX: only expose the reading values when status is "online".
        // A stale/no_signal sensor no longer leaks its last-known
        // value as if it were current.
        "temperature" => $status === "online" && $row["temperature"] !== null ? (float) $row["temperature"] : null,
        "humidity"    => $status === "online" && $row["humidity"] !== null ? (float) $row["humidity"] : null,
        "moisture"    => $status === "online" && $row["moisture"] !== null ? (float) $row["moisture"] : null,

        // Threshold-based risk (SAFE/WARNING/DANGER), from sensor_thresholds.
        // null whenever the sensor isn't "online" (no trustworthy reading to judge).
        "temperature_status" => $temperatureStatus,
        "humidity_status"    => $humidityStatus,
        "moisture_status"    => $moistureStatus,
        "risk_status"         => $riskStatus,

        // Kept as-is regardless of status, so the front-end can still
        // show "last seen X min ago" for disconnected sensors.
        "updated_at"           => $row["updated_at"], // e.g. "2026-07-09 14:32:10" or null if never reported
        "seconds_since_update" => $secondsSince,        // null if never reported
    ];
}

echo json_encode([
    "success" => true,
    "server_time" => date("Y-m-d H:i:s"),
    "sensors" => $sensors
]);