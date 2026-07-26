<?php

$host = "localhost";
$dbname = "grainsense_final_db";
$username = "root";
$password = "";

$conn = mysqli_connect($host, $username, $password, $dbname);

if (!$conn) {
    die("Connection Failed : " . mysqli_connect_error());
}

mysqli_set_charset($conn, "utf8");

?>