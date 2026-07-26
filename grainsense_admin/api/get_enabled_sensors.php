<?php

include "../config/database.php";

header("Content-Type: application/json");

$result = mysqli_query($conn,"
SELECT
sensor_code,
sensor_type,
gpio_pin,
enabled
FROM sensors
ORDER BY sensor_id ASC
");

$sensors = [];

while($row = mysqli_fetch_assoc($result))
{
    $sensors[] = $row;
}

echo json_encode([
    "success" => true,
    "sensors" => $sensors
]);

?>