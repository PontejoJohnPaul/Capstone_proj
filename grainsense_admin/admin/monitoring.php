<?php
if (session_status() == PHP_SESSION_NONE) {
    session_start();
}
include "header.php";
?>
<?php
include "../config/database.php";

// Tanging mga sensor na naka-Enable at hindi pa Removed ang ipapakita sa Monitoring.
// NOTE: This query is ONLY used to build the initial card layout. It does NOT
// fetch any reading values. All temperature / humidity / moisture values are
// loaded afterwards, live, by monitoring.js via api/get_live_monitoring.php,
// which reads exclusively from the sensor_latest table.
$result = mysqli_query(
    $conn,
    "SELECT * FROM sensors WHERE enabled = 1 AND removed = 0 ORDER BY sensor_type, sensor_code"
);

//========================================
// CACHE BUSTING (see header.php for explanation)
//========================================
$monitoringCssVersion = filemtime(__DIR__ . "/../css/monitoring.css");
$monitoringJsVersion  = filemtime(__DIR__ . "/../js/monitoring.js");
?>

<link rel="stylesheet" href="../css/monitoring.css?v=<?php echo $monitoringCssVersion; ?>">

<div class="wrapper">

    <?php include "sidebar.php"; ?>

    <div class="content">

        <div class="d-flex justify-content-between align-items-center mb-4">
            <div>
                <h2 class="fw-bold">Live Monitoring</h2>
                <p class="text-muted mb-0">Real-time readings of all active sensors</p>
            </div>

            <span class="badge bg-secondary" id="liveStatusBadge">
                <i class="bi bi-arrow-repeat"></i>
                Connected. 
            </span>
        </div>

        <div class="row" id="monitoringContainer">

            <?php if (mysqli_num_rows($result) === 0): ?>

                <div class="col-12">
                    <div class="card p-4 text-center text-muted">
                        <i class="bi bi-exclamation-circle fs-2 mb-2"></i>
                        <p class="mb-0">No sensors enabled. Go to
                            <a href="sensors.php">Sensor Management</a> to enabled sensors.</p>
                    </div>
                </div>

            <?php else: ?>

                <?php while ($sensor = mysqli_fetch_assoc($result)): ?>

                    <div class="col-lg-4 col-md-6 mb-4">
                        <div class="card monitor-card"
                             data-sensor-id="<?php echo $sensor['sensor_id']; ?>"
                             data-sensor-type="<?php echo htmlspecialchars($sensor['sensor_type']); ?>">

                            <div class="card-body">

                                <div class="d-flex justify-content-between align-items-start">
                                    <h5>
                                        <i class="bi <?php echo $sensor['sensor_type'] === 'DHT' ? 'bi-thermometer-half' : 'bi-droplet-half'; ?>"></i>
                                        <?php echo htmlspecialchars($sensor['sensor_name'] ?: $sensor['sensor_code']); ?>
                                    </h5>

                                    <span class="badge bg-secondary status-badge">
                                        <i class="bi bi-broadcast"></i>
                                        Loading...
                                    </span>
                                </div>

                                <p class="text-muted mb-3"><?php echo htmlspecialchars($sensor['sensor_code']); ?> &middot; <?php echo htmlspecialchars($sensor['gpio_pin']); ?></p>

                                <hr>

                                <?php if ($sensor['sensor_type'] === 'DHT'): ?>

                                    <div class="reading-row">
                                        <span class="reading-label">Temperature</span>
                                        <span class="reading-value temperature-value">--&deg;C</span>
                                    </div>

                                    <div class="reading-row">
                                        <span class="reading-label">Humidity</span>
                                        <span class="reading-value humidity-value">--%</span>
                                    </div>

                                <?php else: ?>

                                    <div class="reading-row">
                                        <span class="reading-label">Moisture</span>
                                        <span class="reading-value moisture-value">--%</span>
                                    </div>

                                <?php endif; ?>

                                <p class="last-updated mt-3 mb-0">
                                    <i class="bi bi-clock-history"></i>
                                    Last updated: <span class="last-updated-time">Loading...</span>
                                </p>

                            </div>
                        </div>
                    </div>

                <?php endwhile; ?>

            <?php endif; ?>

        </div>

    </div>

</div>

<script src="../js/monitoring.js?v=<?php echo $monitoringJsVersion; ?>"></script>

<?php include "footer.php"; ?>