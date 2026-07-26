<?php
// POST /forgot_password_request.php
// Body: { "email": "farmer@email.com" }
// Generates a 4-digit code, saves it to password_resets, and emails it via Gmail SMTP.
header('Content-Type: application/json');

require_once __DIR__ . '/../config/database.php';

// Manual PHPMailer install (no Composer) — these three files live inside the
// phpmailer folder's `src` subfolder.
require_once __DIR__ . '/../phpmailer/src/Exception.php';
require_once __DIR__ . '/../phpmailer/src/PHPMailer.php';
require_once __DIR__ . '/../phpmailer/src/SMTP.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

$input = json_decode(file_get_contents('php://input'), true);
$email = trim($input['email'] ?? '');

if ($email === '') {
    echo json_encode(['success' => false, 'message' => 'Email is required.']);
    exit;
}

$stmt = $conn->prepare("SELECT user_id, fullname FROM users WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$user = $stmt->get_result()->fetch_assoc();
$stmt->close();

// Always return success even if the email isn't found — this stops people from using
// this endpoint to check which emails are registered in the system.
if (!$user) {
    echo json_encode(['success' => true, 'message' => 'If that email is registered, a code has been sent.']);
    exit;
}

$code = str_pad((string) random_int(0, 9999), 4, '0', STR_PAD_LEFT);

// Compute the expiry using MySQL's own clock (NOW() + 10 minutes) instead of PHP's date()/strtotime().
// This avoids codes appearing to "expire immediately" when the PHP server and MySQL server
// have different timezone settings.
$insert = $conn->prepare("INSERT INTO password_resets (user_id, code, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 10 MINUTE))");
$insert->bind_param("is", $user['user_id'], $code);
$insert->execute();
$insert->close();

$mail = new PHPMailer(true);
try {
    $mail->isSMTP();
    $mail->Host       = 'smtp.gmail.com';
    $mail->SMTPAuth   = true;
    $mail->Username   = 'paulitomapagmahal9@gmail.com';
    $mail->Password   = 'gwwwhkkhdoyowzex';
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port       = 587;

    $mail->setFrom('paulitomapagmahal9@gmail.com', 'GrainSense');
    $mail->addAddress($email, $user['fullname']);

    $mail->isHTML(true);
    $mail->Subject = 'GrainSense Password Reset Code';
    $mail->Body    = "Hi {$user['fullname']},<br><br>"
                    . "Your GrainSense password reset code is:<br>"
                    . "<b style='font-size:24px; letter-spacing:4px;'>{$code}</b><br><br>"
                    . "This code expires in 10 minutes. If you did not request this, you can safely ignore this email.";
    $mail->AltBody = "Your GrainSense password reset code is: {$code}. This code expires in 10 minutes.";

    $mail->send();
    echo json_encode(['success' => true, 'message' => 'If that email is registered, a code has been sent.']);
} catch (Exception $e) {
    error_log('PHPMailer error: ' . $mail->ErrorInfo);
    echo json_encode(['success' => false, 'message' => 'Failed to send the reset code. Please try again.']);
}

$conn->close();