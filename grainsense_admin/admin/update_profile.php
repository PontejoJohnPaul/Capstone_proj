<?php
if (session_status() == PHP_SESSION_NONE) {
    session_start();
}

include "../config/database.php";
require_once "../includes/log_helper.php";

if (!isset($_SESSION['user_id'])) {
    header("Location: login.php");
    exit();
}

$user_id = $_SESSION['user_id'];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    $form_type = $_POST['form_type'] ?? '';

    if ($form_type === 'profile') {

        $fullname = trim($_POST['fullname'] ?? '');
        $username = trim($_POST['username'] ?? '');
        $email    = trim($_POST['email'] ?? '');
        $phone    = trim($_POST['phone'] ?? '');

        if ($fullname === '' || $username === '') {
            $_SESSION['error'] = "Full Name and Username cannot be left blank.";
            header("Location: settings.php");
            exit();
        }

        // Check if another user already has the same username
        $check = mysqli_prepare($conn, "SELECT user_id FROM users WHERE username = ? AND user_id != ?");
        mysqli_stmt_bind_param($check, "si", $username, $user_id);
        mysqli_stmt_execute($check);
        $checkResult = mysqli_stmt_get_result($check);

        if (mysqli_fetch_assoc($checkResult)) {
            $_SESSION['error'] = "This username is already taken by another account.";
            mysqli_stmt_close($check);
            header("Location: settings.php");
            exit();
        }
        mysqli_stmt_close($check);

        $stmt = mysqli_prepare(
            $conn,
            "UPDATE users SET fullname = ?, username = ?, email = ?, phone = ? WHERE user_id = ?"
        );
        mysqli_stmt_bind_param($stmt, "ssssi", $fullname, $username, $email, $phone, $user_id);
        $ok = mysqli_stmt_execute($stmt);
        mysqli_stmt_close($stmt);

        if ($ok) {
            $_SESSION['fullname'] = $fullname;
            $_SESSION['success'] = "Profile updated successfully.";

            logSystemEvent($conn, 'PROFILE_UPDATED', 'Admin updated their profile information.', $user_id, $fullname);
        } else {
            $_SESSION['error'] = "An error occurred while updating the profile. Please try again.";
        }

    } elseif ($form_type === 'password') {

        $current_password = $_POST['current_password'] ?? '';
        $new_password     = $_POST['new_password'] ?? '';
        $confirm_password = $_POST['confirm_password'] ?? '';

        if ($new_password !== $confirm_password) {
            $_SESSION['error'] = "New Password and Confirm Password do not match.";
            header("Location: settings.php");
            exit();
        }

        if (strlen($new_password) < 6) {
            $_SESSION['error'] = "New password must be at least 6 characters.";
            header("Location: settings.php");
            exit();
        }

        // Get the current hashed password
        $stmt = mysqli_prepare($conn, "SELECT password FROM users WHERE user_id = ?");
        mysqli_stmt_bind_param($stmt, "i", $user_id);
        mysqli_stmt_execute($stmt);
        $result = mysqli_stmt_get_result($stmt);
        $row = mysqli_fetch_assoc($result);
        mysqli_stmt_close($stmt);

        // NOTE: The current password in the users table is SHA256-hashed
        // (e64b78fc3bc91bcbc7dc232ba8ec59e0). Once a password is rewritten using
        // password_hash(), password_verify() will be used going forward instead
        // of sha256() for checking the current password.
        if (!$row || !password_verify_compat($current_password, $row['password'])) {
            $_SESSION['error'] = "Your current password is incorrect.";
            header("Location: settings.php");
            exit();
        }

        $new_hashed = password_hash($new_password, PASSWORD_DEFAULT);

        $stmt = mysqli_prepare($conn, "UPDATE users SET password = ? WHERE user_id = ?");
        mysqli_stmt_bind_param($stmt, "si", $new_hashed, $user_id);
        $ok = mysqli_stmt_execute($stmt);
        mysqli_stmt_close($stmt);

        if ($ok) {
            $_SESSION['success'] = "Password updated successfully.";

            logSystemEvent($conn, 'PASSWORD_CHANGED', 'Admin changed their account password.', $user_id, $_SESSION['fullname'] ?? null);
        } else {
            $_SESSION['error'] = "An error occurred while updating the password. Please try again.";
        }
    }

    header("Location: settings.php");
    exit();
}

header("Location: settings.php");
exit();

/**
 * Compatibility checker: supports both the old (sha256) and new
 * (password_hash/bcrypt) password formats in the users table.
 * Once all existing passwords have been migrated to password_hash(),
 * the sha256 fallback here can be removed.
 */
function password_verify_compat($plain, $hashed)
{
    if (password_verify($plain, $hashed)) {
        return true;
    }

    // Fallback for legacy accounts still using sha256 password format
    return hash('sha256', $plain) === $hashed;
}