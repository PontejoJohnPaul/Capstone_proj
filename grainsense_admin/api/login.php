<?php

session_start();
header('Content-Type: application/json');

require_once("../config/database.php");
require_once("../includes/log_helper.php");

if ($_SERVER["REQUEST_METHOD"] != "POST") {
    echo json_encode(['success' => false, 'message' => 'Invalid request.']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$rawUsername = trim($input['username'] ?? '');
$rawPassword = trim($input['password'] ?? '');

if ($rawUsername === '' || $rawPassword === '') {
    echo json_encode(['success' => false, 'message' => 'Username and password are required.']);
    exit;
}

$username = $rawUsername;
$password = md5($rawPassword);

$sql = "
SELECT *
FROM users
WHERE username = ?
AND password = ?
LIMIT 1
";

$stmt = mysqli_prepare($conn, $sql);
mysqli_stmt_bind_param($stmt, "ss", $username, $password);
mysqli_stmt_execute($stmt);

$result = mysqli_stmt_get_result($stmt);
$user = mysqli_fetch_assoc($result);

mysqli_stmt_close($stmt);

if (!$user) {
    logSystemEvent($conn, 'LOGIN_FAILED', 'Invalid username or password.', null, $username);
    echo json_encode(['success' => false, 'message' => 'Invalid username or password.']);
    exit;
}

// This is the Admin Login page — only admin-role accounts should get in here.
if ($user['role'] !== 'admin') {
    logSystemEvent($conn, 'LOGIN_FAILED', 'Non-admin account attempted admin login.', $user['user_id'], $user['username']);
    echo json_encode(['success' => false, 'message' => 'This account does not have admin access.']);
    exit;
}

$_SESSION["user_id"] = $user["user_id"];
$_SESSION["fullname"] = $user["fullname"];
$_SESSION["role"] = $user["role"];

logSystemEvent($conn, 'LOGIN_SUCCESS', 'Admin logged in successfully.', $user['user_id'], $user['username']);

echo json_encode(['success' => true, 'message' => 'Login successful.']);

?>