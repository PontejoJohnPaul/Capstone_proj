<?php

header("Content-Type: application/json");

include "../config/database.php";

//========================================
// STALENESS THRESHOLD
// Firmware saves a reading every ~2s when
// the value changes, but at minimum every
// 5 minutes even if unchanged (heartbeat).
// So a reading older than this means the
// sensor is no longer actually reporting
// (unplugged / powered off / disconnected),
// even if it's still "enabled" in the DB.
// 360s = 6 minutes gives a small buffer
// over the 5-minute heartbeat.
//========================================
$STALE_THRESHOLD_SECONDS = 360;

$response = [
    "success" => true,
    "cards" => [
        "temperature" => null,
        "humidity" => null,
        "moisture" => null,
        "last_update" => null
    ],
    "sensors" => []
];

// Fetch ALL sensors (not just enabled) so we can still show
// "Disabled" rows for sensors that were turned off on purpose.
$sql = "
SELECT
    sensor_id,
    sensor_code,
    sensor_name,
    sensor_type,
    enabled
FROM sensors
ORDER BY sensor_code
";

$result = mysqli_query($conn, $sql);

if (!$result) {
    echo json_encode([
        "success" => false,
        "message" => "Failed to load sensors: " . mysqli_error($conn)
    ]);
    exit;
}

//========================================
// FIX: added "AND created_at >= NOW() - INTERVAL ? SECOND"
// so we only ever fetch a reading if it's still FRESH.
// If the latest row is older than that, the query
// returns 0 rows -> sensor is treated as "no_signal"
// even though enabled = 1, instead of showing yesterday's
// leftover value.
//========================================
$readingStmt = mysqli_prepare(
    $conn,
    "
    SELECT
        temperature,
        humidity,
        moisture,
        created_at
    FROM sensor_readings
    WHERE sensor_id = ?
      AND created_at >= (NOW() - INTERVAL ? SECOND)
    ORDER BY reading_id DESC
    LIMIT 1
    "
);

// Accumulators for card averages
// (only fresh readings ever reach this point, so
// stale/dead sensors no longer skew the averages)
$tempSum = 0;   $tempCount = 0;
$humSum  = 0;   $humCount  = 0;
$moistSum = 0;  $moistCount = 0;
$latestUpdate = null;

while ($sensor = mysqli_fetch_assoc($result)) {

    $sensorId    = $sensor["sensor_id"];
    $isEnabled   = ((int) $sensor["enabled"]) === 1;
    $sensorType  = $sensor["sensor_type"];

    $sensorData = [
        "sensor_code" => $sensor["sensor_code"],
        "sensor_name" => $sensor["sensor_name"],
        "sensor_type" => $sensorType,
        "enabled"     => $isEnabled ? 1 : 0,
        "status"      => "disabled", // will be overwritten below
        "temperature" => null,
        "humidity"    => null,
        "moisture"    => null,
        "created_at"  => null
    ];

    if ($isEnabled) {

        mysqli_stmt_bind_param(
            $readingStmt,
            "ii",
            $sensorId,
            $STALE_THRESHOLD_SECONDS
        );
        mysqli_stmt_execute($readingStmt);
        $readingResult = mysqli_stmt_get_result($readingStmt);

        if ($readingResult && mysqli_num_rows($readingResult) > 0) {

            // Fresh reading found -> sensor is actually reporting
            $reading = mysqli_fetch_assoc($readingResult);

            $sensorData["status"]      = "online";
            $sensorData["temperature"] = $reading["temperature"];
            $sensorData["humidity"]    = $reading["humidity"];
            $sensorData["moisture"]    = $reading["moisture"];
            $sensorData["created_at"]  = $reading["created_at"];

            if ($sensorType === "DHT") {

                if ($reading["temperature"] !== null) {
                    $tempSum += (float) $reading["temperature"];
                    $tempCount++;
                }

                if ($reading["humidity"] !== null) {
                    $humSum += (float) $reading["humidity"];
                    $humCount++;
                }

            } else {

                if ($reading["moisture"] !== null) {
                    $moistSum += (float) $reading["moisture"];
                    $moistCount++;
                }

            }

            if ($reading["created_at"] !== null) {
                if ($latestUpdate === null || $reading["created_at"] > $latestUpdate) {
                    $latestUpdate = $reading["created_at"];
                }
            }

        } else {

            // Enabled, but no reading within the freshness window
            // -> sensor is (probably) unplugged / disconnected
            $sensorData["status"] = "no_signal";

        }
    }

    $response["sensors"][] = $sensorData;
}

mysqli_stmt_close($readingStmt);

//========================================
// Final card values (based only on fresh readings)
//========================================

$response["cards"]["temperature"] = $tempCount > 0
    ? round($tempSum / $tempCount, 1)
    : null;

$response["cards"]["humidity"] = $humCount > 0
    ? round($humSum / $humCount, 1)
    : null;

$response["cards"]["moisture"] = $moistCount > 0
    ? round($moistSum / $moistCount, 1)
    : null;

$response["cards"]["last_update"] = $latestUpdate;

echo json_encode($response);