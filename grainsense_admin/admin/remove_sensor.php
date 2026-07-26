<?php
if (session_status() == PHP_SESSION_NONE) {
    session_start();
}

include "../config/database.php";
require_once "../includes/log_helper.php";

if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    $sensor_id = $_POST['sensor_id'] ?? null;
    $action = $_POST['action'] ?? 'disable';

    if ($sensor_id && ctype_digit($sensor_id)) {

        if ($action === 'delete') {

            // Check muna kung enabled pa ba ang sensor
            $check = mysqli_prepare($conn, "SELECT enabled, sensor_name, sensor_code FROM sensors WHERE sensor_id = ?");
            mysqli_stmt_bind_param($check, "i", $sensor_id);
            mysqli_stmt_execute($check);
            $res = mysqli_stmt_get_result($check);
            $row = mysqli_fetch_assoc($res);
            mysqli_stmt_close($check);

            if ($row && (int)$row['enabled'] === 0) {
                // Soft-hide lang, hindi totoong DELETE. Nananatili sa database.
                $stmt = mysqli_prepare($conn, "UPDATE sensors SET removed = 1 WHERE sensor_id = ?");
                mysqli_stmt_bind_param($stmt, "i", $sensor_id);
                $ok = mysqli_stmt_execute($stmt);
                mysqli_stmt_close($stmt);

                if ($ok) {
                    $label = $row['sensor_name'] ?: $row['sensor_code'];
                    $_SESSION['success'] = "Successfully removed: " . $label;

                    logSystemEvent(
                        $conn,
                        'SENSOR_REMOVED',
                        "Sensor removed from Sensor Management: {$label}",
                        $_SESSION['user_id'] ?? null,
                        $_SESSION['fullname'] ?? null
                    );
                } else {
                    $_SESSION['error'] = "May error habang nire-remove ang sensor. Subukan ulit.";
                }
            } else {
                // Naka-enable pa, bawal i-remove
                $_SESSION['error'] = "Hindi pwedeng i-remove ang sensor habang Enabled pa. I-disable muna ito.";
            }

        } else {
            // Default: disable lang
            $check = mysqli_prepare($conn, "SELECT sensor_name, sensor_code FROM sensors WHERE sensor_id = ?");
            mysqli_stmt_bind_param($check, "i", $sensor_id);
            mysqli_stmt_execute($check);
            $res = mysqli_stmt_get_result($check);
            $row = mysqli_fetch_assoc($res);
            mysqli_stmt_close($check);

            $stmt = mysqli_prepare($conn, "UPDATE sensors SET enabled = 0 WHERE sensor_id = ?");
            mysqli_stmt_bind_param($stmt, "i", $sensor_id);
            mysqli_stmt_execute($stmt);
            mysqli_stmt_close($stmt);

            if ($row) {
                $label = $row['sensor_name'] ?: $row['sensor_code'];
                logSystemEvent(
                    $conn,
                    'SENSOR_DISABLED',
                    "Sensor disabled: {$label}",
                    $_SESSION['user_id'] ?? null,
                    $_SESSION['fullname'] ?? null
                );
            }
        }
    }

    header("Location: sensors.php");
    exit();
}

// ===== Kung hindi POST, dito ito in-include ni sensors.php para ipakita lang ang confirmation card =====
?>

<!-- Remove Confirmation Card -->
<div class="modal fade confirm-card" id="removeSensorModal" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">

            <div class="modal-header">
                <div class="w-100">
                    <div class="confirm-icon remove">
                        <i class="bi bi-exclamation-triangle"></i>
                    </div>
                </div>
            </div>

            <div class="modal-body">
                <p class="mb-0">
                    Are you sure you want to remove
                    <strong id="removeSensorName"></strong>?
                </p>
            </div>

            <div class="modal-footer">
                <button type="button" class="btn btn-light border" data-bs-dismiss="modal">No</button>
                <form action="remove_sensor.php" method="POST" class="m-0">
                    <input type="hidden" name="sensor_id" id="removeSensorId" value="">
                    <input type="hidden" name="action" value="delete">
                    <button type="submit" class="btn btn-danger">Yes</button>
                </form>
            </div>

        </div>
    </div>
</div>