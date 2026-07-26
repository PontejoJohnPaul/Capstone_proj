<?php $currentPage = basename($_SERVER['PHP_SELF']); ?>

<!-- Hamburger button: fixed on screen, only visible on mobile/tablet (see dashboard.css).
     Lives outside .sidebar so it stays clickable even while the sidebar itself is
     off-screen (translateX(-100%)). -->
<button class="sidebar-toggle" id="sidebarToggle" aria-label="Toggle menu">
    <i class="bi bi-list"></i>
</button>

<!-- Backdrop: darkens the page behind the sidebar when it's open on mobile,
     and lets the user tap outside the sidebar to close it. -->
<div class="sidebar-backdrop" id="sidebarBackdrop"></div>

<div class="sidebar" id="sidebar">

    <div class="sidebar-brand">
        <img src="../img/grain-sense-logo.png" alt="GrainSense" class="sidebar-logo">
        <div class="sidebar-brand-text">
            <span class="sidebar-brand-name">GrainSense</span>
            <span class="sidebar-brand-tag">Admin Panel</span>
        </div>
    </div>

    <nav class="sidebar-nav">

        <a href="dashboard.php" class="<?php echo $currentPage === 'dashboard.php' ? 'active' : ''; ?>">
            <i class="bi bi-speedometer2"></i>
            Dashboard
        </a>

        <a href="sensors.php" class="<?php echo $currentPage === 'sensors.php' ? 'active' : ''; ?>">
            <i class="bi bi-cpu"></i>
            Sensor Management
        </a>

        <a href="monitoring.php" class="<?php echo $currentPage === 'monitoring.php' ? 'active' : ''; ?>">
            <i class="bi bi-activity"></i>
            Live Monitoring
        </a>

        <a href="farmers.php" class="<?php echo $currentPage === 'farmers.php' ? 'active' : ''; ?>">
            <i class="bi bi-people"></i>
            Farmer Management
        </a>

        <a href="system_logs.php" class="<?php echo $currentPage === 'system_logs.php' ? 'active' : ''; ?>">
            <i class="bi bi-clock-history"></i>
            System Logs
        </a>

        <a href="settings.php" class="<?php echo $currentPage === 'settings.php' ? 'active' : ''; ?>">
            <i class="bi bi-gear"></i>
            Settings
        </a>

    </nav>

    <div class="sidebar-footer">
        <a href="logout.php" class="sidebar-logout">
            <i class="bi bi-box-arrow-right"></i>
            Logout
        </a>
    </div>

</div>