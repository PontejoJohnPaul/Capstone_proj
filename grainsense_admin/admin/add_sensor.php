<?php
if (session_status() == PHP_SESSION_NONE) {
    session_start();
}

include "../config/database.php";
require_once "../includes/log_helper.php";

if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    $sensor_id = $_POST['sensor_id'] ?? null;
    $action = $_POST['action'] ?? 'enable';

    if ($sensor_id && ctype_digit($sensor_id)) {

        if ($action === 'restore') {
            // Galing sa "Add Sensor" confirmation: ibalik sa Sensor Management (naka-Disable pa rin)
            $check = mysqli_prepare($conn, "SELECT sensor_name, sensor_code FROM sensors WHERE sensor_id = ?");
            mysqli_stmt_bind_param($check, "i", $sensor_id);
            mysqli_stmt_execute($check);
            $res = mysqli_stmt_get_result($check);
            $row = mysqli_fetch_assoc($res);
            mysqli_stmt_close($check);

            $stmt = mysqli_prepare($conn, "UPDATE sensors SET removed = 0 WHERE sensor_id = ?");
            mysqli_stmt_bind_param($stmt, "i", $sensor_id);
            $ok = mysqli_stmt_execute($stmt);
            mysqli_stmt_close($stmt);

            if ($ok && $row) {
                $label = $row['sensor_name'] ?: $row['sensor_code'];
                $_SESSION['success'] = "Successfully added: " . $label;

                logSystemEvent(
                    $conn,
                    'SENSOR_ADDED',
                    "Sensor added back to Sensor Management: {$label}",
                    $_SESSION['user_id'] ?? null,
                    $_SESSION['fullname'] ?? null
                );
            }
        } else {
            // Galing sa "Enable" button ng isang card
            $check = mysqli_prepare($conn, "SELECT sensor_name, sensor_code FROM sensors WHERE sensor_id = ?");
            mysqli_stmt_bind_param($check, "i", $sensor_id);
            mysqli_stmt_execute($check);
            $res = mysqli_stmt_get_result($check);
            $row = mysqli_fetch_assoc($res);
            mysqli_stmt_close($check);

            $stmt = mysqli_prepare($conn, "UPDATE sensors SET enabled = 1 WHERE sensor_id = ?");
            mysqli_stmt_bind_param($stmt, "i", $sensor_id);
            mysqli_stmt_execute($stmt);
            mysqli_stmt_close($stmt);

            if ($row) {
                $label = $row['sensor_name'] ?: $row['sensor_code'];
                logSystemEvent(
                    $conn,
                    'SENSOR_ENABLED',
                    "Sensor enabled: {$label}",
                    $_SESSION['user_id'] ?? null,
                    $_SESSION['fullname'] ?? null
                );
            }
        }
    }

    header("Location: sensors.php");
    exit();
}

// ===== Kung hindi POST, dito ito in-include ni sensors.php para ipakita lang ang modal/card =====

// Yung mga na-remove na, pwede pang ibalik via "Add Sensor"
$availableResult = mysqli_query($conn, "SELECT * FROM sensors WHERE removed = 1 ORDER BY sensor_code");
?>

<!-- Add Sensor Modal (pagpili ng sensor) -->
<div class="modal fade" id="addSensorModal">
    <div class="modal-dialog">
        <div class="modal-content">

            <div class="modal-header">
                <h5><i class="bi bi-cpu"></i> Add Sensor</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>

            <div class="modal-body">
                <label class="form-label">Select Sensor</label>
                <select id="addSensorSelect" class="form-select" required>
                    <option value="" disabled selected>-- Choose Sensor --</option>
                    <?php while ($s = mysqli_fetch_assoc($availableResult)): ?>
                        <option
                            value="<?php echo $s['sensor_id']; ?>"
                            data-name="<?php echo htmlspecialchars($s['sensor_name'] ?: $s['sensor_code']); ?>">
                            <?php echo htmlspecialchars($s['sensor_code']); ?>
                            — <?php echo htmlspecialchars($s['sensor_name'] ?: ($s['sensor_type'] === 'DHT' ? 'DHT22 (Temp & Humidity)' : 'Moisture')); ?>
                            (<?php echo htmlspecialchars($s['gpio_pin']); ?>)
                        </option>
                    <?php endwhile; ?>
                </select>
            </div>

            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                <button type="button" class="btn btn-success" id="addSensorNextBtn">Add Sensor</button>
            </div>

        </div>
    </div>
</div>

<!-- Add Confirmation Card -->
<div class="modal fade confirm-card" id="confirmAddModal" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">

            <div class="modal-header">
                <div class="w-100">
                    <div class="confirm-icon add">
                        <i class="bi bi-plus-circle"></i>
                    </div>
                </div>
            </div>

            <div class="modal-body">
                <p class="mb-0">
                    Are you sure you want to add
                    <strong id="confirmAddSensorName"></strong>?
                </p>
            </div>

            <div class="modal-footer">
                <button type="button" class="btn btn-light border" data-bs-dismiss="modal">No</button>
                <form action="add_sensor.php" method="POST" class="m-0">
                    <input type="hidden" name="sensor_id" id="confirmAddSensorId" value="">
                    <input type="hidden" name="action" value="restore">
                    <button type="submit" class="btn btn-success">Yes</button>
                </form>
            </div>

        </div>
    </div>
</div>