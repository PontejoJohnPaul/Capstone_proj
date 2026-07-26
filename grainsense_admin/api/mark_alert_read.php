<?php
/**
 * mark_alert_read.php
 *
 * Marks a single alert as read. Handles BOTH alert sources:
 *   - "rt-<analysis_id>"   -> ai_analysis.is_read
 *   - "hist-<result_id>"   -> batch_results.is_read
 *
 * Called automatically when the mobile app closes an alert's popup card.
 */

header("Content-Type: application/json");

include "../config/database.php";

$id = $_POST['id'] ?? null; // e.g. "rt-5" or "hist-3"

if (!$id || !preg_match('/^(rt|hist)-(\d+)$/', $id, $m)) {
    echo json_encode(["success" => false, "message" => "Invalid parameters."]);
    exit;
}

$source    = $m[1];
$source_id = (int) $m[2];

if ($source === 'rt') {
    $stmt = mysqli_prepare($conn, "UPDATE ai_analysis SET is_read = 1 WHERE analysis_id = ?");
} else {
    $stmt = mysqli_prepare($conn, "UPDATE batch_results SET is_read = 1 WHERE result_id = ?");
}

mysqli_stmt_bind_param($stmt, "i", $source_id);
$ok = mysqli_stmt_execute($stmt);
mysqli_stmt_close($stmt);

echo json_encode(["success" => (bool) $ok]);