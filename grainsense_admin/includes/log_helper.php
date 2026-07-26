<?php
function logSystemEvent($conn, $action, $description = '', $user_id = null, $username = null) {
    $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    $agent = $_SERVER['HTTP_USER_AGENT'] ?? 'unknown';

    $sql = "INSERT INTO system_logs (user_id, username, action, description, ip_address, user_agent)
            VALUES (?, ?, ?, ?, ?, ?)";
    $stmt = mysqli_prepare($conn, $sql);
    mysqli_stmt_bind_param($stmt, "isssss", $user_id, $username, $action, $description, $ip, $agent);
    mysqli_stmt_execute($stmt);
    mysqli_stmt_close($stmt);
}