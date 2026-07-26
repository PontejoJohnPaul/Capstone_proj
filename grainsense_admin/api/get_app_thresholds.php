<?php
// api/get_app_thresholds.php
// Returns the current thresholds (single row) from sensor_thresholds.

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../config/database.php';

$sql = "SELECT threshold_id, temperature_min, temperature_safe, temperature_max,
               humidity_min, humidity_safe, humidity_max,
               moisture_min, moisture_safe, moisture_max, updated_at
        FROM sensor_thresholds
        ORDER BY threshold_id ASC
        LIMIT 1";

$result = mysqli_query($conn, $sql);

if (!$result) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Query failed: " . mysqli_error($conn)]);
    exit();
}

$row = mysqli_fetch_assoc($result);

if (!$row) {
    http_response_code(404);
    echo json_encode(["success" => false, "message" => "No threshold record found."]);
    exit();
}

echo json_encode([
    "success" => true,
    "data" => $row
]);

mysqli_close($conn);