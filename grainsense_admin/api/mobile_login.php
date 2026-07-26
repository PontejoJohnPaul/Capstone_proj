<?php

header("Content-Type: application/json");

require_once("../config/database.php");

if ($_SERVER["REQUEST_METHOD"] != "POST") {
    echo json_encode(["success" => false, "message" => "Invalid request method."]);
    exit;
}

$username = trim($_POST["username"] ?? '');
$password = md5(trim($_POST["password"] ?? ''));

if ($username === '' || $password === md5('')) {
    echo json_encode(["success" => false, "message" => "Username and password are required."]);
    exit;
}

// Same check as the admin login (api/login.php), but joined with
// farmer_profile and restricted to role = 'farmer' -- this endpoint
// is only for the mobile app, admins log in through the website.
$sql = "
SELECT u.user_id, u.fullname, u.username, u.email, u.phone, u.role,
       fp.farmer_id, fp.farm_name, fp.address
FROM users u
JOIN farmer_profile fp ON fp.user_id = u.user_id
WHERE u.username = ?
  AND u.password = ?
  AND u.role = 'farmer'
LIMIT 1
";

$stmt = mysqli_prepare($conn, $sql);
mysqli_stmt_bind_param($stmt, "ss", $username, $password);
mysqli_stmt_execute($stmt);

$result = mysqli_stmt_get_result($stmt);
$user = mysqli_fetch_assoc($result);

mysqli_stmt_close($stmt);

if ($user) {
    echo json_encode([
        "success" => true,
        "user" => [
            "user_id"   => (int) $user["user_id"],
            "fullname"  => $user["fullname"],
            "username"  => $user["username"],
            "email"     => $user["email"],
            "phone"     => $user["phone"],
            "farmer_id" => (int) $user["farmer_id"],
            "farm_name" => $user["farm_name"],
            "address"   => $user["address"],
        ],
    ]);
} else {
    echo json_encode([
        "success" => false,
        "message" => "Invalid username or password.",
    ]);
}