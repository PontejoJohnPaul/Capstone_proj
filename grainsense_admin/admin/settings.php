<?php
if (session_status() == PHP_SESSION_NONE) {
    session_start();
}
include "header.php";
?>
<?php
include "../config/database.php";

// Get the currently logged-in admin
$user_id = $_SESSION['user_id'];
$stmt = mysqli_prepare($conn, "SELECT * FROM users WHERE user_id = ?");
mysqli_stmt_bind_param($stmt, "i", $user_id);
mysqli_stmt_execute($stmt);
$userResult = mysqli_stmt_get_result($stmt);
$user = mysqli_fetch_assoc($userResult);
mysqli_stmt_close($stmt);

// Get the current thresholds
$thresholdResult = mysqli_query($conn, "SELECT * FROM sensor_thresholds WHERE threshold_id = 1");
$thresholds = mysqli_fetch_assoc($thresholdResult);

$errorMsg = $_SESSION['error'] ?? null;
$successMsg = $_SESSION['success'] ?? null;
unset($_SESSION['error'], $_SESSION['success']);
?>

<link rel="stylesheet" href="../css/settings.css">

<style>
.confirm-card .modal-content {
    border: none;
    border-radius: 22px;
    box-shadow: 0 15px 40px rgba(0,0,0,.18);
    text-align: center;
    padding: 1.75rem 1.5rem;
}
.confirm-card .modal-header,
.confirm-card .modal-footer {
    border: none;
    justify-content: center;
}
.confirm-card .modal-body {
    padding-top: .25rem;
}
.confirm-card .confirm-icon {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto .75rem auto;
    font-size: 1.75rem;
}
.confirm-card .confirm-icon.add {
    background: #e6f7ed;
    color: #1F6B2C;
}
.confirm-card .modal-footer .btn {
    min-width: 110px;
    border-radius: 10px;
}
</style>

<div class="wrapper">

    <?php include "sidebar.php"; ?>

    <div class="content">

        <div class="mb-4">
            <h2 class="fw-bold">Settings</h2>
            <p class="text-muted mb-0">Manage your profile and system preferences</p>
        </div>

        <?php if ($errorMsg): ?>
            <div class="alert alert-danger"><?php echo htmlspecialchars($errorMsg); ?></div>
        <?php endif; ?>

        <div class="row">

            <!-- ===== Profile Settings ===== -->
            <div class="col-lg-6 mb-4">
                <div class="card settings-card p-4">

                    <h4><i class="bi bi-person-circle"></i> Profile Information</h4>
                    <p class="text-muted">Update your personal details</p>
                    <hr>

                    <form action="update_profile.php" method="POST" id="profileForm" class="needs-confirm"
                          data-confirm-title="Save Profile Changes?"
                          data-confirm-msg="Are you sure you want to save these changes to your profile?">
                        <input type="hidden" name="form_type" value="profile">

                        <div class="mb-3">
                            <label class="form-label">Full Name</label>
                            <input type="text" name="fullname" class="form-control"
                                   value="<?php echo htmlspecialchars($user['fullname']); ?>" required>
                        </div>

                        <div class="mb-3">
                            <label class="form-label">Username</label>
                            <input type="text" name="username" class="form-control"
                                   value="<?php echo htmlspecialchars($user['username']); ?>" required>
                        </div>

                        <div class="mb-3">
                            <label class="form-label">Email</label>
                            <input type="email" name="email" class="form-control"
                                   value="<?php echo htmlspecialchars($user['email'] ?? ''); ?>"
                                   placeholder="admin@example.com">
                        </div>

                        <div class="mb-3">
                            <label class="form-label">Phone</label>
                            <input type="text" name="phone" class="form-control"
                                   value="<?php echo htmlspecialchars($user['phone'] ?? ''); ?>"
                                   placeholder="09XXXXXXXXX">
                        </div>

                        <div class="mb-2">
                            <label class="form-label">Role</label>
                            <input type="text" class="form-control" value="<?php echo htmlspecialchars($user['role']); ?>" disabled>
                        </div>

                        <button type="submit" class="btn btn-success mt-3">
                            <i class="bi bi-check-circle"></i> Save Changes
                        </button>
                    </form>

                </div>
            </div>

            <!-- ===== Change Password ===== -->
            <div class="col-lg-6 mb-4">
                <div class="card settings-card p-4">

                    <h4><i class="bi bi-shield-lock"></i> Change Password</h4>
                    <p class="text-muted">Keep your account secure</p>
                    <hr>

                    <form action="update_profile.php" method="POST" id="passwordForm">
                        <input type="hidden" name="form_type" value="password">

                        <div class="mb-3">
                            <label class="form-label">Current Password</label>
                            <input type="password" name="current_password" class="form-control" required>
                        </div>

                        <div class="mb-3">
                            <label class="form-label">New Password</label>
                            <input type="password" name="new_password" id="new_password" class="form-control" required minlength="6">
                        </div>

                        <div class="mb-3">
                            <label class="form-label">Confirm New Password</label>
                            <input type="password" name="confirm_password" id="confirm_password" class="form-control" required minlength="6">
                            <small class="text-danger d-none" id="passwordMismatch">Passwords do not match.</small>
                        </div>

                        <button type="submit" class="btn btn-warning mt-3">
                            <i class="bi bi-key"></i> Update Password
                        </button>
                    </form>

                </div>
            </div>

            <!-- ===== Sensor Threshold Settings ===== -->
            <div class="col-lg-6 mb-4">
                <div class="card settings-card p-4">

                    <h4><i class="bi bi-sliders"></i> Sensor Thresholds</h4>
                    <p class="text-muted">Set the minimum, safe, and maximum limits for each sensor</p>
                    <hr>

                    <form action="update_sensor.php" method="POST" id="thresholdForm" class="needs-confirm"
                          data-confirm-title="Save New Thresholds?"
                          data-confirm-msg="Are you sure you want to update the sensor thresholds? This will affect risk status calculations.">

                        <p class="fw-bold mb-2"><i class="bi bi-thermometer-half"></i> Temperature (°C)</p>
                        <div class="row">
                            <div class="col-4 mb-3">
                                <label class="form-label">Minimum</label>
                                <input type="number" step="0.1" name="temperature_min" class="form-control"
                                       value="<?php echo htmlspecialchars($thresholds['temperature_min'] ?? ''); ?>" required>
                            </div>
                            <div class="col-4 mb-3">
                                <label class="form-label">Safe</label>
                                <input type="number" step="0.1" name="temperature_safe" class="form-control"
                                       value="<?php echo htmlspecialchars($thresholds['temperature_safe'] ?? ''); ?>" required>
                            </div>
                            <div class="col-4 mb-3">
                                <label class="form-label">Maximum</label>
                                <input type="number" step="0.1" name="temperature_max" class="form-control"
                                       value="<?php echo htmlspecialchars($thresholds['temperature_max'] ?? ''); ?>" required>
                            </div>
                        </div>

                        <p class="fw-bold mb-2 mt-2"><i class="bi bi-droplet-half"></i> Humidity (%)</p>
                        <div class="row">
                            <div class="col-4 mb-3">
                                <label class="form-label">Minimum</label>
                                <input type="number" step="0.1" name="humidity_min" class="form-control"
                                       value="<?php echo htmlspecialchars($thresholds['humidity_min'] ?? ''); ?>" required>
                            </div>
                            <div class="col-4 mb-3">
                                <label class="form-label">Safe</label>
                                <input type="number" step="0.1" name="humidity_safe" class="form-control"
                                       value="<?php echo htmlspecialchars($thresholds['humidity_safe'] ?? ''); ?>" required>
                            </div>
                            <div class="col-4 mb-3">
                                <label class="form-label">Maximum</label>
                                <input type="number" step="0.1" name="humidity_max" class="form-control"
                                       value="<?php echo htmlspecialchars($thresholds['humidity_max'] ?? ''); ?>" required>
                            </div>
                        </div>

                        <p class="fw-bold mb-2 mt-2"><i class="bi bi-moisture"></i> Moisture (%)</p>
                        <div class="row">
                            <div class="col-4 mb-3">
                                <label class="form-label">Minimum</label>
                                <input type="number" step="0.1" name="moisture_min" class="form-control"
                                       value="<?php echo htmlspecialchars($thresholds['moisture_min'] ?? ''); ?>" required>
                            </div>
                            <div class="col-4 mb-3">
                                <label class="form-label">Safe</label>
                                <input type="number" step="0.1" name="moisture_safe" class="form-control"
                                       value="<?php echo htmlspecialchars($thresholds['moisture_safe'] ?? ''); ?>" required>
                            </div>
                            <div class="col-4 mb-3">
                                <label class="form-label">Maximum</label>
                                <input type="number" step="0.1" name="moisture_max" class="form-control"
                                       value="<?php echo htmlspecialchars($thresholds['moisture_max'] ?? ''); ?>" required>
                            </div>
                        </div>

                        <button type="submit" class="btn btn-success mt-3">
                            <i class="bi bi-check-circle"></i> Save Thresholds
                        </button>
                    </form>

                </div>
            </div>

            <!-- ===== Account Info ===== -->
            <div class="col-lg-6 mb-4">
                <div class="card settings-card p-4">

                    <h4><i class="bi bi-info-circle"></i> Account Info</h4>
                    <p class="text-muted">Details of your account</p>
                    <hr>

                    <p class="mb-2"><strong>Account Created:</strong> <?php echo htmlspecialchars($user['created_at']); ?></p>
                    <p class="mb-0"><strong>User ID:</strong> <?php echo htmlspecialchars($user['user_id']); ?></p>

                </div>
            </div>

        </div>

    </div>

    <!-- Generic Confirm Modal (reused by Profile + Threshold forms) -->
    <div class="modal fade confirm-card" id="genericConfirmModal" tabindex="-1">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">

                <div class="modal-header">
                    <div class="w-100">
                        <div class="confirm-icon add">
                            <i class="bi bi-question-circle"></i>
                        </div>
                    </div>
                </div>

                <div class="modal-body">
                    <h5 id="genericConfirmTitle" class="mb-2"></h5>
                    <p class="mb-0 text-muted" id="genericConfirmMsg"></p>
                </div>

                <div class="modal-footer">
                    <button type="button" class="btn btn-light border" data-bs-dismiss="modal">Cancel</button>
                    <button type="button" class="btn btn-success" id="genericConfirmProceedBtn">Yes, Save</button>
                </div>

            </div>
        </div>
    </div>

    <!-- Success Modal -->
    <?php if ($successMsg): ?>
    <div class="modal fade confirm-card" id="settingsSuccessModal" tabindex="-1">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">

                <div class="modal-header">
                    <div class="w-100">
                        <div class="confirm-icon add">
                            <i class="bi bi-check-circle"></i>
                        </div>
                    </div>
                </div>

                <div class="modal-body">
                    <p class="mb-0"><?php echo htmlspecialchars($successMsg); ?></p>
                </div>

                <div class="modal-footer">
                    <button type="button" class="btn btn-success" data-bs-dismiss="modal">OK</button>
                </div>

            </div>
        </div>
    </div>
    <script>
    document.addEventListener("DOMContentLoaded", function () {
        const successModal = new bootstrap.Modal(document.getElementById("settingsSuccessModal"));
        successModal.show();
    });
    </script>
    <?php endif; ?>

</div>

<script src="../js/settings.js"></script>

<?php include "footer.php"; ?>