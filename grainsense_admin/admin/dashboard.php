<?php include "header.php"; ?>

<div class="wrapper">

<?php include "sidebar.php"; ?>

<div class="content">

    <div class="topbar">

        <div>
            <h2>Dashboard</h2>
            <p class="topbar-subtitle">Real-time post-harvest monitoring overview</p>
        </div>

        <div class="welcome-user">
            <div class="user-avatar"><?php echo strtoupper(substr($_SESSION['fullname'], 0, 1)); ?></div>
            <div class="user-info">
                <span class="user-label">Welcome back</span>
                <strong><?php echo $_SESSION['fullname']; ?></strong>
            </div>
        </div>

    </div>

    <!-- Dashboard Cards -->

    <div class="row mt-4">

        <div class="col-md-4">

            <div class="card dashboard-card">

                <div class="icon-circle temperature">
                    <i class="bi bi-thermometer-half"></i>
                </div>

                <div class="card-info">
                    <h5>Temperature</h5>
                    <h2 id="cardTemperature">-- °C</h2>
                </div>

            </div>

        </div>

        <div class="col-md-4">

            <div class="card dashboard-card">

                <div class="icon-circle humidity">
                    <i class="bi bi-droplet-half"></i>
                </div>

                <div class="card-info">
                    <h5>Humidity</h5>
                    <h2 id="cardHumidity">-- %</h2>
                </div>

            </div>

        </div>

        <div class="col-md-4">

            <div class="card dashboard-card">

                <div class="icon-circle moisture">
                    <i class="bi bi-moisture"></i>
                </div>

                <div class="card-info">
                    <h5>Average Moisture</h5>
                    <h2 id="cardMoisture">-- %</h2>
                </div>

            </div>

        </div>

    </div>

    <!-- Sensor Count Cards -->

    <div class="row mt-3">

        <div class="col-md-3 col-6">

            <div class="card dashboard-card">

                <div class="icon-circle total-sensors">
                    <i class="bi bi-hdd-network"></i>
                </div>

                <div class="card-info">
                    <h5>Total Sensors</h5>
                    <h2 id="cardTotalSensors">--</h2>
                </div>

            </div>

        </div>

        <div class="col-md-3 col-6">

            <div class="card dashboard-card">

                <div class="icon-circle online-sensors">
                    <i class="bi bi-check-circle"></i>
                </div>

                <div class="card-info">
                    <h5>Online</h5>
                    <h2 id="cardOnlineSensors">--</h2>
                </div>

            </div>

        </div>

        <div class="col-md-3 col-6">

            <div class="card dashboard-card">

                <div class="icon-circle no-signal-sensors">
                    <i class="bi bi-exclamation-triangle"></i>
                </div>

                <div class="card-info">
                    <h5>No Signal</h5>
                    <h2 id="cardNoSignalSensors">--</h2>
                </div>

            </div>

        </div>

        <div class="col-md-3 col-6">

            <div class="card dashboard-card">

                <div class="icon-circle disabled-sensors">
                    <i class="bi bi-slash-circle"></i>
                </div>

                <div class="card-info">
                    <h5>Disabled</h5>
                    <h2 id="cardDisabledSensors">--</h2>
                </div>

            </div>

        </div>

    </div>

    <div class="last-update-row mt-2">

        <span class="live-dot"></span>

        <small class="text-muted">

            Last Update :
            <span id="lastUpdate">--</span>

        </small>

    </div>

    <!-- Live Sensors -->

    <div class="card mt-4 p-4">

        <div class="card-header-row">

            <h4><i class="bi bi-cpu"></i> Live Sensors</h4>

            <select id="sensorFilter" class="sensor-filter-select">
                <option value="all">All Status</option>
                <option value="online">Online</option>
                <option value="no_signal">No Signal</option>
                <option value="disabled">Disabled</option>
            </select>

        </div>

        <hr>

        <div class="table-responsive">

            <table class="table">

                <thead>

                    <tr>

                        <th>Sensor</th>

                        <th>Reading</th>

                        <th>Status</th>

                    </tr>

                </thead>

                <tbody id="sensorTable">

                </tbody>

            </table>

        </div>

    </div>

</div>

</div>

<!--
    FIX: dashboard.js was being loaded TWICE -- once here, and again
    inside footer.php. That meant loadDashboard() ran twice on page
    load and TWO separate setInterval polling loops were running at
    once (double the fetch calls to get_dashboard.php every 2 sec).
    footer.php already includes dashboard.js (with cache-busting), so
    the duplicate tag here has been removed.
-->

<?php include "footer.php"; ?>