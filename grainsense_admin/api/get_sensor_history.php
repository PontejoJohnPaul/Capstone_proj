<?php
/**
 * get_sensor_history.php
 *
 * Returns aggregated historical readings from sensor_readings, averaged
 * across ALL sensors of each type (DHT -> temperature/humidity,
 * MOISTURE -> moisture) for the requested time range.
 *
 * Query param: range = today | 7days | 30days (default: today)
 */

header("Content-Type: application/json");

include "../config/database.php";

$range = $_GET['range'] ?? 'today';

if ($range === '7days') {

    $sql = "
        SELECT
            DATE(sr.created_at) AS bucket,
            DATE_FORMAT(sr.created_at, '%a') AS label,
            AVG(CASE WHEN s.sensor_type = 'DHT' THEN sr.temperature END) AS avg_temp,
            AVG(CASE WHEN s.sensor_type = 'DHT' THEN sr.humidity END) AS avg_humidity,
            AVG(CASE WHEN s.sensor_type = 'MOISTURE' THEN sr.moisture END) AS avg_moisture,
            MIN(sr.created_at) AS bucket_start
        FROM sensor_readings sr
        INNER JOIN sensors s ON s.sensor_id = sr.sensor_id
        WHERE sr.created_at >= (NOW() - INTERVAL 7 DAY)
        GROUP BY bucket, label
        ORDER BY bucket_start ASC
    ";

} elseif ($range === '30days') {

    $sql = "
        SELECT
            FLOOR(DATEDIFF(sr.created_at, (CURDATE() - INTERVAL 30 DAY)) / 7) AS bucket,
            CONCAT('W', FLOOR(DATEDIFF(sr.created_at, (CURDATE() - INTERVAL 30 DAY)) / 7) + 1) AS label,
            AVG(CASE WHEN s.sensor_type = 'DHT' THEN sr.temperature END) AS avg_temp,
            AVG(CASE WHEN s.sensor_type = 'DHT' THEN sr.humidity END) AS avg_humidity,
            AVG(CASE WHEN s.sensor_type = 'MOISTURE' THEN sr.moisture END) AS avg_moisture,
            MIN(sr.created_at) AS bucket_start
        FROM sensor_readings sr
        INNER JOIN sensors s ON s.sensor_id = sr.sensor_id
        WHERE sr.created_at >= (CURDATE() - INTERVAL 30 DAY)
        GROUP BY bucket, label
        ORDER BY bucket_start ASC
    ";

} else {

    // "today" (default)
    $sql = "
        SELECT
            HOUR(sr.created_at) AS bucket,
            DATE_FORMAT(sr.created_at, '%l %p') AS label,
            AVG(CASE WHEN s.sensor_type = 'DHT' THEN sr.temperature END) AS avg_temp,
            AVG(CASE WHEN s.sensor_type = 'DHT' THEN sr.humidity END) AS avg_humidity,
            AVG(CASE WHEN s.sensor_type = 'MOISTURE' THEN sr.moisture END) AS avg_moisture,
            MIN(sr.created_at) AS bucket_start
        FROM sensor_readings sr
        INNER JOIN sensors s ON s.sensor_id = sr.sensor_id
        WHERE DATE(sr.created_at) = CURDATE()
        GROUP BY bucket, label
        ORDER BY bucket_start ASC
    ";

}

$result = mysqli_query($conn, $sql);

if (!$result) {
    echo json_encode([
        "success" => false,
        "message" => "Failed to load sensor history: " . mysqli_error($conn)
    ]);
    exit;
}

$readings = [];

while ($row = mysqli_fetch_assoc($result)) {
    $readings[] = [
        "label" => trim($row["label"]),
        "avg_temp" => $row["avg_temp"] !== null ? round((float) $row["avg_temp"], 1) : null,
        "avg_humidity" => $row["avg_humidity"] !== null ? round((float) $row["avg_humidity"], 1) : null,
        "avg_moisture" => $row["avg_moisture"] !== null ? round((float) $row["avg_moisture"], 1) : null,
    ];
}

echo json_encode([
    "success" => true,
    "range" => $range,
    "readings" => $readings
]);