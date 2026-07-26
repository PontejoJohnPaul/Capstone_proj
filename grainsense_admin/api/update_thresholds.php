<?php
// api/update_thresholds.php
// Updates the single row in sensor_thresholds with new min/safe/max values.
//
// Expected JSON body (all fields optional — only sent fields are updated):
// {
//   "temperature_min": 20, "temperature_safe": 25, "temperature_max": 32,
//   "humidity_min": 40,    "humidity_safe": 60,    "humidity_max": 70,
//   "moisture_min": 10,    "moisture_safe": 13,    "moisture_max": 14
// }

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Only POST is allowed."]);
    exit();
}

require_once __DIR__ . '/../config/database.php';

$input = json_decode(file_get_contents("php://input"), true);

if (!is_array($input)) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Invalid or missing JSON body."]);
    exit();
}

// Only these columns may be updated — whitelist to avoid arbitrary column injection.
$allowedFields = [
    "temperature_min", "temperature_safe", "temperature_max",
    "humidity_min",    "humidity_safe",    "humidity_max",
    "moisture_min",    "moisture_safe",    "moisture_max",
];

$setParts = [];
$types = "";
$values = [];

foreach ($allowedFields as $field) {
    if (isset($input[$field]) && is_numeric($input[$field])) {
        $setParts[] = "`$field` = ?";
        $types .= "d"; // double
        $values[] = (float) $input[$field];
    }
}

if (empty($setParts)) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "No valid numeric fields provided."]);
    exit();
}

// Assumes a single threshold row (system-wide thresholds).
// If you later support per-batch/per-sensor thresholds, pass threshold_id from the app instead.
$thresholdId = isset($input['threshold_id']) && is_numeric($input['threshold_id'])
    ? (int) $input['threshold_id']
    : 1;

$sql = "UPDATE sensor_thresholds SET " . implode(", ", $setParts) . ", updated_at = CURRENT_TIMESTAMP WHERE threshold_id = ?";
$types .= "i";
$values[] = $thresholdId;

$stmt = mysqli_prepare($conn, $sql);
if (!$stmt) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Prepare failed: " . mysqli_error($conn)]);
    exit();
}

mysqli_stmt_bind_param($stmt, $types, ...$values);

if (!mysqli_stmt_execute($stmt)) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Update failed: " . mysqli_stmt_error($stmt)]);
    exit();
}

echo json_encode([
    "success" => true,
    "message" => "Thresholds updated successfully.",
    "affected_rows" => mysqli_stmt_affected_rows($stmt)
]);

mysqli_stmt_close($stmt);
mysqli_close($conn);