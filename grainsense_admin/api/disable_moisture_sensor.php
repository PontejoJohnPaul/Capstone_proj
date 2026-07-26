<?php

header("Content-Type: application/json");

include "../config/database.php";

$sensor_id = $_POST['sensor_id'] ?? null;
$healthy_sacks = $_POST['healthy_sacks'] ?? null;
$damaged_sacks = $_POST['damaged_sacks'] ?? null;

if (
    !$sensor_id || !ctype_digit((string)$sensor_id) ||
    !is_numeric($healthy_sacks) || (int)$healthy_sacks < 0 ||
    !is_numeric($damaged_sacks) || (int)$damaged_sacks < 0
) {
    echo json_encode(["success" => false, "message" => "Invalid parameters."]);
    exit;
}

$activeCheck = mysqli_prepare($conn, "SELECT batch_id, total_sacks FROM batches WHERE sensor_id = ? AND status = 'ACTIVE' ORDER BY batch_id DESC LIMIT 1");
mysqli_stmt_bind_param($activeCheck, "i", $sensor_id);
mysqli_stmt_execute($activeCheck);
$activeRes = mysqli_stmt_get_result($activeCheck);
$batchRow = mysqli_fetch_assoc($activeRes);
mysqli_stmt_close($activeCheck);

if (!$batchRow) {
    echo json_encode(["success" => false, "message" => "No ACTIVE batch found for this sensor."]);
    exit;
}

$batch_id = $batchRow['batch_id'];

mysqli_begin_transaction($conn);

try {
    $stmt1 = mysqli_prepare($conn, "INSERT INTO batch_results (batch_id, healthy_sacks, damaged_sacks) VALUES (?, ?, ?)");
    mysqli_stmt_bind_param($stmt1, "iii", $batch_id, $healthy_sacks, $damaged_sacks);
    mysqli_stmt_execute($stmt1);
    mysqli_stmt_close($stmt1);

    $stmt2 = mysqli_prepare($conn, "UPDATE batches SET status = 'FINISHED' WHERE batch_id = ?");
    mysqli_stmt_bind_param($stmt2, "i", $batch_id);
    mysqli_stmt_execute($stmt2);
    mysqli_stmt_close($stmt2);

    $stmt3 = mysqli_prepare($conn, "UPDATE sensors SET enabled = 0, status_changed_at = NOW() WHERE sensor_id = ?");
    mysqli_stmt_bind_param($stmt3, "i", $sensor_id);
    mysqli_stmt_execute($stmt3);
    mysqli_stmt_close($stmt3);

    mysqli_commit($conn);

    echo json_encode(["success" => true, "batch_id" => $batch_id]);

} catch (Exception $e) {
    mysqli_rollback($conn);
    echo json_encode(["success" => false, "message" => "Failed: " . $e->getMessage()]);
}