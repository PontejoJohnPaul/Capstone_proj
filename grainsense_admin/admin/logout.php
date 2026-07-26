<?php

session_start();

require_once("../config/database.php");
require_once("../includes/log_helper.php");

if (isset($_SESSION['user_id'])) {
    logSystemEvent($conn, 'LOGOUT', 'Admin logged out.', $_SESSION['user_id'], $_SESSION['fullname'] ?? null);
}

session_destroy();

header("Location: login.php");
exit();

?>