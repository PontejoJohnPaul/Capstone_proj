<?php
// POST /change_password.php
// Body: { "currentPassword": "...", "newPassword": "..." }
// Verifies the current password against the users table before saving the new one.
header('Content-Type: application/json');

require_once __DIR__ . '/../config/database.php';

$input = json_decode(file_get_contents('php://input'), true);
$currentPassword = (string) ($input['currentPassword'] ?? '');
$newPassword     = (string) ($input['newPassword'] ?? '');

// TODO: Replace this with the actual logged-in user's ID once you have auth/session in place.
// For now it falls back to user_id 2 (the sample "farmer" account in your DB dump), same as
// get_user_profile.php / update_user_profile.php.
$user_id = isset($input['user_id']) ? (int) $input['user_id'] : 2;

if ($currentPassword === '' || $newPassword === '') {
    echo json_encode(['success' => false, 'message' => 'All fields are required.']);
    exit;
}

if (strlen($newPassword) < 6) {
    echo json_encode(['success' => false, 'message' => 'New password must be at least 6 characters.']);
    exit;
}

$stmt = $conn->prepare("SELECT password FROM users WHERE user_id = ?");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$row = $stmt->get_result()->fetch_assoc();
$stmt->close();

if (!$row) {
    echo json_encode(['success' => false, 'message' => 'User not found.']);
    exit;
}

// NOTE: this uses md5() to match the hashing already used by your `users` table / mobile_login.php
// (the sample password in your DB dump is a 32-character MD5 hash). If you later upgrade to
// password_hash()/password_verify(), update this file — and mobile_login.php — together.
if (md5($currentPassword) !== $row['password']) {
    echo json_encode(['success' => false, 'message' => 'Current password is incorrect.']);
    exit;
}

$hashedNewPassword = md5($newPassword);

$update = $conn->prepare("UPDATE users SET password = ? WHERE user_id = ?");
$update->bind_param("si", $hashedNewPassword, $user_id);

if ($update->execute()) {
    echo json_encode(['success' => true, 'message' => 'Password changed successfully.']);
} else {
    echo json_encode(['success' => false, 'message' => 'Failed to update password.']);
}

$update->close();
$conn->close();