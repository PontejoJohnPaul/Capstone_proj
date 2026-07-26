<?php
// GET /get_user_profile.php
// Returns the logged-in farmer's profile (name, email, mobile) from the `users` table.
header('Content-Type: application/json');

require_once __DIR__ . '/../config/database.php';

// TODO: Replace this with the actual logged-in user's ID once you have auth/session in place.
// For now it falls back to user_id 2 (the sample "farmer" account in your DB dump).
$user_id = isset($_GET['user_id']) ? (int) $_GET['user_id'] : 2;

$stmt = $conn->prepare("SELECT fullname, email, phone FROM users WHERE user_id = ?");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();

if ($row = $result->fetch_assoc()) {
    // `users.fullname` is a single column, so split it into first/last for the app's ProfileData shape.
    $nameParts = explode(' ', trim($row['fullname']), 2);

    echo json_encode([
        'success' => true,
        'data' => [
            'firstName' => $nameParts[0] ?? '',
            'lastName'  => $nameParts[1] ?? '',
            'email'     => $row['email'] ?? '',
            'mobile'    => $row['phone'] ?? '',
        ],
    ]);
} else {
    echo json_encode([
        'success' => false,
        'message' => 'User not found.',
    ]);
}

$stmt->close();
$conn->close();