<?php
if (session_status() == PHP_SESSION_NONE) {
    session_start();
}

include "../config/database.php";
require_once "../includes/log_helper.php";

if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    $fields = [
        'temperature_min', 'temperature_safe', 'temperature_max',
        'humidity_min', 'humidity_safe', 'humidity_max',
        'moisture_min', 'moisture_safe', 'moisture_max'
    ];

    $values = [];
    $allNumeric = true;

    foreach ($fields as $field) {
        $val = $_POST[$field] ?? null;
        if (!is_numeric($val)) {
            $allNumeric = false;
        }
        $values[$field] = $val;
    }

    if ($allNumeric) {

        // Basic sanity check: min <= safe <= max, per metric
        $validOrder =
            $values['temperature_min'] <= $values['temperature_safe'] &&
            $values['temperature_safe'] <= $values['temperature_max'] &&
            $values['humidity_min'] <= $values['humidity_safe'] &&
            $values['humidity_safe'] <= $values['humidity_max'] &&
            $values['moisture_min'] <= $values['moisture_safe'] &&
            $values['moisture_safe'] <= $values['moisture_max'];

        if (!$validOrder) {
            $_SESSION['error'] = "Minimum must be less than or equal to Safe, and Safe must be less than or equal to Maximum, for each sensor.";
            header("Location: settings.php");
            exit();
        }

        $stmt = mysqli_prepare($conn,
            "UPDATE sensor_thresholds SET
                temperature_min = ?, temperature_safe = ?, temperature_max = ?,
                humidity_min = ?, humidity_safe = ?, humidity_max = ?,
                moisture_min = ?, moisture_safe = ?, moisture_max = ?
             WHERE threshold_id = 1"
        );
        mysqli_stmt_bind_param(
            $stmt,
            "ddddddddd",
            $values['temperature_min'], $values['temperature_safe'], $values['temperature_max'],
            $values['humidity_min'], $values['humidity_safe'], $values['humidity_max'],
            $values['moisture_min'], $values['moisture_safe'], $values['moisture_max']
        );
        $ok = mysqli_stmt_execute($stmt);
        mysqli_stmt_close($stmt);

        if ($ok) {
            $_SESSION['success'] = "Sensor thresholds updated successfully.";

            $description = sprintf(
                "Thresholds updated — Temp: %s/%s/%s, Humidity: %s/%s/%s, Moisture: %s/%s/%s (min/safe/max)",
                $values['temperature_min'], $values['temperature_safe'], $values['temperature_max'],
                $values['humidity_min'], $values['humidity_safe'], $values['humidity_max'],
                $values['moisture_min'], $values['moisture_safe'], $values['moisture_max']
            );

            logSystemEvent($conn, 'THRESHOLD_UPDATED', $description, $_SESSION['user_id'] ?? null, $_SESSION['fullname'] ?? null);
        } else {
            $_SESSION['error'] = "An error occurred while updating the thresholds. Please try again.";
        }
    } else {
        $_SESSION['error'] = "Please fill in all threshold fields with valid numbers.";
    }
}

header("Location: settings.php");
exit();