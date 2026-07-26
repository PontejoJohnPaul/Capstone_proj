<?php
if(session_status() == PHP_SESSION_NONE)
{
    session_start();
}

if(!isset($_SESSION['user_id']))
{
    header("Location: login.php");
    exit();
}

//========================================
// CACHE BUSTING
// filemtime() returns the last-modified timestamp of the file.
// Appending it as ?v=... means the URL itself changes every time
// the file is edited, so the browser is forced to fetch a fresh
// copy instead of serving a stale one from cache -- no more
// Ctrl+Shift+R needed after every edit.
//========================================
$dashboardCssVersion = filemtime(__DIR__ . "/../css/dashboard.css");
$sensorsCssVersion    = filemtime(__DIR__ . "/../css/sensors.css");
?>

<!DOCTYPE html>
<html lang="en">

<head>

<meta charset="UTF-8">

<meta name="viewport" content="width=device-width, initial-scale=1">

<title>GrainSense Admin</title>

<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" rel="stylesheet">

<link href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-icons/1.11.3/font/bootstrap-icons.min.css" rel="stylesheet">

<link rel="stylesheet" href="../css/dashboard.css?v=<?php echo $dashboardCssVersion; ?>">

<link rel="stylesheet" href="../css/sensors.css?v=<?php echo $sensorsCssVersion; ?>">

</head>

<body>