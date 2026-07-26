<?php

header("Content-Type: application/json");

include "../config/database.php";

$sensor_id = $_POST['sensor_id'] ?? null;
$enabled = $_POST['enabled'] ?? null;

if (!$sensor_id || !ctype_digit((string)$sensor_id) || ($enabled !== '0' && $enabled !== '1')) {
    echo json_encode(["success" => false, "message" => "Invalid parameters."]);
    exit;
}

$stmt = mysqli_prepare($conn, "UPDATE sensors SET enabled = ?, status_changed_at = NOW() WHERE sensor_id = ? AND removed = 0");
mysqli_stmt_bind_param($stmt, "ii", $enabled, $sensor_id);
$ok = mysqli_stmt_execute($stmt);
mysqli_stmt_close($stmt);

echo json_encode(["success" => (bool) $ok]);