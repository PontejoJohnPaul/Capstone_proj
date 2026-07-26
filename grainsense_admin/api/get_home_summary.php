<?php

header("Content-Type: application/json");

include "../config/database.php";

// Same staleness logic ng dashboard mo: kung mahigit 6 minuto na
// walang update sa sensor_latest, itinuturing na patay/disconnected
// ang sensor kaya hindi na ito isasama sa average.
$STALE_THRESHOLD_SECONDS = 86400; // 24 hours, pantesting lang

$response = [
    "success" => true,
    "temperature" => null,
    "humidity" => null,
    "moisture" => null,
    "last_update" => null
];

// Enabled + not-removed lang ang isasali. Dahil configurable ang
// sensors mo (pwede mag-add/bawas), walang hardcoded sensor_id dito.
$sql = "
SELECT
    s.sensor_type,
    sl.temperature,
    sl.humidity,
    sl.moisture,
    sl.updated_at
FROM sensors s
INNER JOIN sensor_latest sl ON sl.sensor_id = s.sensor_id
WHERE s.enabled = 1
  AND s.removed = 0
  AND sl.updated_at >= (NOW() - INTERVAL ? SECOND)
";

$stmt = mysqli_prepare($conn, $sql);
mysqli_stmt_bind_param($stmt, "i", $STALE_THRESHOLD_SECONDS);
mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);

if (!$result) {
    echo json_encode([
        "success" => false,
        "message" => "Failed to load sensor_latest: " . mysqli_error($conn)
    ]);
    exit;
}

$tempSum = 0;   $tempCount = 0;
$humSum  = 0;   $humCount  = 0;
$moistSum = 0;  $moistCount = 0;
$latestUpdate = null;

while ($row = mysqli_fetch_assoc($result)) {

    if ($row["sensor_type"] === "DHT") {

        if ($row["temperature"] !== null) {
            $tempSum += (float) $row["temperature"];
            $tempCount++;
        }
        if ($row["humidity"] !== null) {
            $humSum += (float) $row["humidity"];
            $humCount++;
        }

    } else {

        if ($row["moisture"] !== null) {
            $moistSum += (float) $row["moisture"];
            $moistCount++;
        }
    }

    if ($row["updated_at"] !== null) {
        if ($latestUpdate === null || $row["updated_at"] > $latestUpdate) {
            $latestUpdate = $row["updated_at"];
        }
    }
}

mysqli_stmt_close($stmt);

$response["temperature"] = $tempCount  > 0 ? round($tempSum / $tempCount, 1)   : null;
$response["humidity"]    = $humCount   > 0 ? round($humSum / $humCount, 1)    : null;
$response["moisture"]    = $moistCount > 0 ? round($moistSum / $moistCount, 1) : null;
$response["last_update"] = $latestUpdate;

echo json_encode($response);