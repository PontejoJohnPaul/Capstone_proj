<?php
// POST /forgot_password_verify.php
// Body: { "email": "farmer@email.com", "code": "1234" }
// Checks whether the code is valid, unused, and not expired — without consuming it yet.
header('Content-Type: application/json');

require_once __DIR__ . '/../config/database.php';

$input = json_decode(file_get_contents('php://input'), true);
$email = trim($input['email'] ?? '');
$code  = trim($input['code'] ?? '');

if ($email === '' || $code === '') {
    echo json_encode(['success' => false, 'message' => 'Email and code are required.']);
    exit;
}

$stmt = $conn->prepare("
    SELECT pr.reset_id
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

if ($row) {
    echo json_encode(['success' => true, 'message' => 'Code verified.']);
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid or expired code.']);
}

$conn->close();