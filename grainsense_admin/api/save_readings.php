<?php

header("Content-Type: application/json");

include "../config/database.php";
include "save_helper.php";

//=============================
// Read JSON from ESP32
//=============================

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data["readings"])) {
    echo json_encode([
        "success" => false,
        "message" => "No readings received."
    ]);
    exit();
}

//=============================
// Create Reading Group
//=============================

$reading_group = "RG" . date("YmdHis");

//=============================
// Save All Readings
//=============================

$savedCount = 0;
$skippedCount = 0;

foreach ($data["readings"] as $reading)
{
    $sensor_code = mysqli_real_escape_string($conn, $reading["sensor_code"]);

    $temperature = isset($reading["temperature"])
        ? floatval($reading["temperature"])
        : "NULL";

    $humidity = isset($reading["humidity"])
        ? floatval($reading["humidity"])
        : "NULL";

    $moisture = isset($reading["moisture"])
        ? floatval($reading["moisture"])
        : "NULL";

    //-----------------------------------
    // Get Sensor
    //-----------------------------------

    $sensorQuery = mysqli_query(
        $conn,
        "SELECT sensor_id, enabled
         FROM sensors
         WHERE sensor_code='$sensor_code'
         LIMIT 1"
    );

    if(mysqli_num_rows($sensorQuery)==0)
        continue;

    $sensor = mysqli_fetch_assoc($sensorQuery);

    if($sensor["enabled"] != 1)
        continue;

    $sensor_id = $sensor["sensor_id"];

    //-----------------------------------
    // Smart Save
    //-----------------------------------

    if(
        !shouldSaveReading(
            $conn,
            $sensor_id,
            $temperature,
            $humidity,
            $moisture
        )
    )
    {
        $skippedCount++;
        continue;
    }

    //-----------------------------------
    // SQL Values
    //-----------------------------------

    $tempValue =
        ($temperature==="NULL")
        ? "NULL"
        : $temperature;

    $humValue =
        ($humidity==="NULL")
        ? "NULL"
        : $humidity;

    $moisValue =
        ($moisture==="NULL")
        ? "NULL"
        : $moisture;

    //-----------------------------------
    // Insert Reading
    //-----------------------------------

    $sql = "
        INSERT INTO sensor_readings
        (
            sensor_id,
            reading_group,
            temperature,
            humidity,
            moisture
        )
        VALUES
        (
            '$sensor_id',
            '$reading_group',
            $tempValue,
            $humValue,
            $moisValue
        )
    ";

    if(mysqli_query($conn,$sql))
    {
    $savedCount++;

    //-----------------------------------
    // Update Latest Sensor Value
    //-----------------------------------

    $latestSQL = "
        INSERT INTO sensor_latest
        (
            sensor_id,
            temperature,
            humidity,
            moisture
        )
        VALUES
        (
            '$sensor_id',
            $tempValue,
            $humValue,
            $moisValue
        )
        ON DUPLICATE KEY UPDATE

            temperature = VALUES(temperature),

            humidity = VALUES(humidity),

            moisture = VALUES(moisture),

            updated_at = CURRENT_TIMESTAMP
    ";

    mysqli_query($conn, $latestSQL);
    }
}

//=============================
// Response
//=============================

echo json_encode([
    "success" => true,
    "saved" => $savedCount,
    "skipped" => $skippedCount,
    "message" => "Smart Save Completed"
]);

?>