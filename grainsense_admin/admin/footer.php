<?php
//========================================
// CACHE BUSTING (see header.php for explanation)
//========================================
$dashboardJsVersion = filemtime(__DIR__ . "/../js/dashboard.js");
$sidebarJsVersion    = filemtime(__DIR__ . "/../js/sidebar.js");
?>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js"></script>

<script src="../js/sidebar.js?v=<?php echo $sidebarJsVersion; ?>"></script>

<script src="../js/dashboard.js?v=<?php echo $dashboardJsVersion; ?>"></script>

</body>

</html>