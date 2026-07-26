<?php
// POST /forgot_password_reset.php
// Body: { "email": "farmer@email.com", "code": "1234", "newPassword": "..." }
// Re-checks the code, then updates the user's password and marks the code as used.
header('Content-Type: application/json');

require_once __DIR__ . '/../config/database.php';

$input = json_decode(file_get_contents('php://input'), true);
$email       = trim($input['email'] ?? '');
$code        = trim($input['code'] ?? '');
$newPassword = (string) ($input['newPassword'] ?? '');

if ($email === '' || $code === '' || $newPassword === '') {
    echo json_encode(['success' => false, 'message' => 'All fields are required.']);
    exit;
}

if (strlen($newPassword) < 6) {
    echo json_encode(['success' => false, 'message' => 'Password must be at least 6 characters.']);
    exit;
}

$stmt = $conn->prepare("
    SELECT pr.reset_id, u.user_id
    FROM password_resets pr
    JOIN users u ON u.user_id = pr.user_id
    WHERE u.email = ? AND pr.code = ? AND pr.used = 0 AND pr.expires_at >= NOW()
    ORDER BY pr.reset_id DESC
    LIMIT 1
");
$stmt->bind_param("ss", $email, $code);
$stmt->execute();
$row = $stmt->get_result()->fetch_assoc();
$stmt->close();

if (!$row) {
    echo json_encode(['success' => false, 'message' => 'Invalid or expired code.']);
    exit;
}

// NOTE: this uses md5() to match the hashing already used by your `users` table / mobile_login.php
// (the sample password in your DB dump is a 32-character MD5 hash). If you later upgrade to
// password_hash()/password_verify(), update this line — and mobile_login.php — together.
$hashedPassword = md5($newPassword);

$update = $conn->prepare("UPDATE users SET password = ? WHERE user_id = ?");
$update->bind_param("si", $hashedPassword, $row['user_id']);
$update->execute();
$update->close();

$markUsed = $conn->prepare("UPDATE password_resets SET used = 1 WHERE reset_id = ?");
$markUsed->bind_param("i", $row['reset_id']);
$markUsed->execute();
$markUsed->close();

echo json_encode(['success' => true, 'message' => 'Password updated successfully.']);

$conn->close();