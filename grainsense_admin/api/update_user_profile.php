<?php
// POST /update_user_profile.php
// Body: { firstName, lastName, email, mobile }
// Saves profile edits back to the `users` table.
header('Content-Type: application/json');

require_once __DIR__ . '/../config/database.php';

$input = json_decode(file_get_contents('php://input'), true);

// TODO: Replace this with the actual logged-in user's ID once you have auth/session in place.
$user_id = isset($input['user_id']) ? (int) $input['user_id'] : 2;

$firstName = trim($input['firstName'] ?? '');
$lastName  = trim($input['lastName'] ?? '');
$email     = trim($input['email'] ?? '');
$mobile    = trim($input['mobile'] ?? '');
$fullname  = trim($firstName . ' ' . $lastName);

if ($fullname === '' || $email === '') {
    echo json_encode([
        'success' => false,
        'message' => 'First name and email are required.',
    ]);
    exit;
}

$stmt = $conn->prepare("UPDATE users SET fullname = ?, email = ?, phone = ? WHERE user_id = ?");
$stmt->bind_param("sssi", $fullname, $email, $mobile, $user_id);

if ($stmt->execute()) {
    echo json_encode([
        'success' => true,
        'message' => 'Profile updated successfully.',
    ]);
} else {
    echo json_encode([
        'success' => false,
        'message' => 'Failed to update profile.',
    ]);
}

$stmt->close();
$conn->close();