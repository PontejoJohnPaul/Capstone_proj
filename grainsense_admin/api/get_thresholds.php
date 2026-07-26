<?php
/**
 * get_thresholds.php
 *
 * REST API endpoint only — NO HTML output.
 *
 * Returns the single row from `sensor_thresholds` (min / safe / max per
 * metric) as JSON so the front-end can compute SAFE / WARNING / DANGER
 * status without hardcoding limits in JS. Any page that needs to evaluate
 * sensor status (Live Monitoring, Dashboard, etc.) should call this
 * instead of duplicating threshold numbers.
 *
 * Same folder placement as get_live_monitoring.php:
 *   /admin/api/get_thresholds.php
 */

header("Content-Type: application/json");

include "../config/database.php";

$result = mysqli_query($conn, "SELECT * FROM sensor_thresholds WHERE threshold_id = 1");

if (!$result || mysqli_num_rows($result) === 0) {
    echo json_encode([
        "success" => false,
        "message" => "Failed to load thresholds: " . mysqli_error($conn)
    ]);
    exit();
}

$row = mysqli_fetch_assoc($result);

echo json_encode([
    "success" => true,
    "thresholds" => [
        "temperature" => [
            "min"  => (float) $row["temperature_min"],
            "safe" => (float) $row["temperature_safe"],
            "max"  => (float) $row["temperature_max"],
        ],
        "humidity" => [
            "min"  => (float) $row["humidity_min"],
            "safe" => (float) $row["humidity_safe"],
            "max"  => (float) $row["humidity_max"],
        ],
        "moisture" => [
            "min"  => (float) $row["moisture_min"],
            "safe" => (float) $row["moisture_safe"],
            "max"  => (float) $row["moisture_max"],
        ]
    ]
]);