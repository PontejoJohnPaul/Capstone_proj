<?php

//==================================
// SETTINGS
//==================================

$tempThreshold = 0.3;
$humidityThreshold = 2;
$moistureThreshold = 2;
$forceSaveMinutes = 5;


//==================================
// Decide if Reading Should Save
//==================================

function shouldSaveReading(
    $conn,
    $sensor_id,
    $temperature,
    $humidity,
    $moisture
)
{
    global
        $tempThreshold,
        $humidityThreshold,
        $moistureThreshold,
        $forceSaveMinutes;

    //------------------------------------
    // Get Latest Reading
    //------------------------------------

    $sql = "
        SELECT *
        FROM sensor_readings
        WHERE sensor_id='$sensor_id'
        ORDER BY created_at DESC
        LIMIT 1
    ";

    $result = mysqli_query($conn,$sql);

    //------------------------------------
    // First Reading
    //------------------------------------

    if(mysqli_num_rows($result)==0)
        return true;

    $last = mysqli_fetch_assoc($result);

    //------------------------------------
    // Force Save - Sensor Was Just Re-enabled
    //------------------------------------
    // Kapag mas bago yung status_changed_at (huling pagka-toggle ng
    // enabled/disabled) kumpara sa huling na-save na reading, ibig
    // sabihin na-disable/enable ang sensor pagkatapos ng huling save.
    // Dapat i-force ang save para hindi na maghintay pa ng threshold
    // o ng 5-minute window.

    $sensorRow = mysqli_query(
        $conn,
        "SELECT status_changed_at
         FROM sensors
         WHERE sensor_id='$sensor_id'
         LIMIT 1"
    );

    if($sensorRow && mysqli_num_rows($sensorRow) > 0)
    {
        $sensorInfo = mysqli_fetch_assoc($sensorRow);

        if(
            !empty($sensorInfo["status_changed_at"]) &&
            strtotime($sensorInfo["status_changed_at"]) > strtotime($last["created_at"])
        )
        {
            return true;
        }
    }

    //------------------------------------
    // Force Save - Time Elapsed
    //------------------------------------

    $minutes =
        (time()-strtotime($last["created_at"]))
        /60;

    if($minutes >= $forceSaveMinutes)
        return true;

    //------------------------------------
    // Temperature
    //------------------------------------

    if(
        $temperature !== "NULL" &&
        $last["temperature"] !== null
    )
    {
        if(
            abs($temperature-$last["temperature"])
            >=
            $tempThreshold
        )
            return true;
    }

    //------------------------------------
    // Humidity
    //------------------------------------

    if(
        $humidity !== "NULL" &&
        $last["humidity"] !== null
    )
    {
        if(
            abs($humidity-$last["humidity"])
            >=
            $humidityThreshold
        )
            return true;
    }

    //------------------------------------
    // Moisture
    //------------------------------------

    if(
        $moisture !== "NULL" &&
        $last["moisture"] !== null
    )
    {
        if(
            abs($moisture-$last["moisture"])
            >=
            $moistureThreshold
        )
            return true;
    }

    //------------------------------------
    // Skip Save
    //------------------------------------

    return false;

}