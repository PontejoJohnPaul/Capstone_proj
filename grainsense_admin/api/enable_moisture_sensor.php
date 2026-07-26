<?php

header("Content-Type: application/json");

include "../config/database.php";

$sensor_id = $_POST['sensor_id'] ?? null;
$total_sacks = $_POST['total_sacks'] ?? null;
$farmer_id = $_POST['farmer_id'] ?? null;

if (
    !$sensor_id || !ctype_digit((string)$sensor_id) ||
    !is_numeric($total_sacks) || (int)$total_sacks <= 0 ||
    !$farmer_id || !ctype_digit((string)$farmer_id)
) {
    echo json_encode(["success" => false, "message" => "Invalid parameters."]);
    exit;
}

// Make sure this farmer actually exists (prevents the FK error we saw before)
$farmerCheck = mysqli_prepare($conn, "SELECT farmer_id FROM farmer_profile WHERE farmer_id = ?");
mysqli_stmt_bind_param($farmerCheck, "i", $farmer_id);
mysqli_stmt_execute($farmerCheck);
$farmerRes = mysqli_stmt_get_result($farmerCheck);
if (!mysqli_fetch_assoc($farmerRes)) {
    mysqli_stmt_close($farmerCheck);
    echo json_encode(["success" => false, "message" => "Farmer account not found. Please log in again."]);
    exit;
}
mysqli_stmt_close($farmerCheck);

// Make sure this is a MOISTURE sensor
$check = mysqli_prepare($conn, "SELECT sensor_type FROM sensors WHERE sensor_id = ? AND removed = 0");
mysqli_stmt_bind_param($check, "i", $sensor_id);
mysqli_stmt_execute($check);
$res = mysqli_stmt_get_result($check);
$sensorRow = mysqli_fetch_assoc($res);
mysqli_stmt_close($check);

if (!$sensorRow || $sensorRow['sensor_type'] !== 'MOISTURE') {
    echo json_encode(["success" => false, "message" => "Sensor not found or not a MOISTURE sensor."]);
    exit;
}

// Prevent starting a second ACTIVE batch on the same sensor
$activeCheck = mysqli_prepare($conn, "SELECT batch_id FROM batches WHERE sensor_id = ? AND status = 'ACTIVE'");
mysqli_stmt_bind_param($activeCheck, "i", $sensor_id);
mysqli_stmt_execute($activeCheck);
$activeRes = mysqli_stmt_get_result($activeCheck);
if (mysqli_fetch_assoc($activeRes)) {
    mysqli_stmt_close($activeCheck);
    echo json_encode(["success" => false, "message" => "This sensor already has an ACTIVE batch."]);
    exit;
}
mysqli_stmt_close($activeCheck);

mysqli_begin_transaction($conn);

try {
    $stmt1 = mysqli_prepare($conn, "UPDATE sensors SET enabled = 1, status_changed_at = NOW() WHERE sensor_id = ?");
    mysqli_stmt_bind_param($stmt1, "i", $sensor_id);
    mysqli_stmt_execute($stmt1);
    mysqli_stmt_close($stmt1);

    $stmt2 = mysqli_prepare($conn, "INSERT INTO batches (farmer_id, sensor_id, total_sacks, status) VALUES (?, ?, ?, 'ACTIVE')");
    mysqli_stmt_bind_param($stmt2, "iii", $farmer_id, $sensor_id, $total_sacks);
    mysqli_stmt_execute($stmt2);
    $newBatchId = mysqli_insert_id($conn);
    mysqli_stmt_close($stmt2);

    mysqli_commit($conn);

    echo json_encode(["success" => true, "batch_id" => $newBatchId]);

} catch (Exception $e) {
    mysqli_rollback($conn);
    echo json_encode(["success" => false, "message" => "Failed: " . $e->getMessage()]);
}