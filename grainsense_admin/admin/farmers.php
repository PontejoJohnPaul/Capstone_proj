<?php
if (session_status() == PHP_SESSION_NONE) {
    session_start();
}

if (!isset($_SESSION['user_id'])) {
    header("Location: login.php");
    exit();
}

include "../config/database.php";

$errors = [];
$success = $_SESSION['success'] ?? null;
unset($_SESSION['success']);

// ===== Add Farmer =====
if ($_SERVER['REQUEST_METHOD'] === 'POST' && ($_POST['action'] ?? '') === 'add_farmer') {

    $fullname  = trim($_POST['fullname'] ?? '');
    $username  = trim($_POST['username'] ?? '');
    $password  = $_POST['password'] ?? '';
    $email     = trim($_POST['email'] ?? '');
    $phone     = trim($_POST['phone'] ?? '');
    $farm_name = trim($_POST['farm_name'] ?? '');
    $address   = trim($_POST['address'] ?? '');

    if ($fullname === '' || $username === '' || $password === '') {
        $errors[] = "Fullname, username, and password are required.";
    }

    // Username must be unique
    if (empty($errors)) {
        $check = mysqli_prepare($conn, "SELECT user_id FROM users WHERE username = ?");
        mysqli_stmt_bind_param($check, "s", $username);
        mysqli_stmt_execute($check);
        mysqli_stmt_store_result($check);
        if (mysqli_stmt_num_rows($check) > 0) {
            $errors[] = "Username already taken. Please choose another.";
        }
        mysqli_stmt_close($check);
    }

    if (empty($errors)) {
        mysqli_begin_transaction($conn);
        try {
            // NOTE: matches the MD5 hashing already used by the existing admin login.
            // Consider migrating to password_hash()/password_verify() when convenient.
            $hashed = md5($password);

            $stmt = mysqli_prepare(
                $conn,
                "INSERT INTO users (fullname, username, password, email, phone, role) VALUES (?, ?, ?, ?, ?, 'farmer')"
            );
            mysqli_stmt_bind_param($stmt, "sssss", $fullname, $username, $hashed, $email, $phone);
            mysqli_stmt_execute($stmt);
            $new_user_id = mysqli_insert_id($conn);
            mysqli_stmt_close($stmt);

            $stmt2 = mysqli_prepare(
                $conn,
                "INSERT INTO farmer_profile (user_id, farm_name, address) VALUES (?, ?, ?)"
            );
            mysqli_stmt_bind_param($stmt2, "iss", $new_user_id, $farm_name, $address);
            mysqli_stmt_execute($stmt2);
            mysqli_stmt_close($stmt2);

            mysqli_commit($conn);
            $_SESSION['success'] = "Successfully added farmer: " . $fullname;
            header("Location: farmers.php");
            exit();
        } catch (mysqli_sql_exception $e) {
            mysqli_rollback($conn);
            $errors[] = "Something went wrong while saving. Please try again.";
        }
    }
}

// ===== Farmer list =====
$farmers = mysqli_query(
    $conn,
    "SELECT u.user_id, u.fullname, u.username, u.email, u.phone, u.created_at,
            fp.farmer_id, fp.farm_name, fp.address
     FROM users u
     JOIN farmer_profile fp ON fp.user_id = u.user_id
     WHERE u.role = 'farmer'
     ORDER BY u.created_at DESC"
);

include "header.php";
?>

<link rel="stylesheet" href="farmers.css">

<div class="wrapper">

<?php include "sidebar.php"; ?>

<div class="content">

    <div class="topbar">

        <div>
            <h2>Farmer Management</h2>
            <p class="topbar-subtitle">Manage registered farmer accounts</p>
        </div>

    </div>

    <?php if ($success): ?>
        <div class="alert alert-success"><?php echo htmlspecialchars($success); ?></div>
    <?php endif; ?>

    <?php if (!empty($errors)): ?>
        <div class="alert alert-danger">
            <?php foreach ($errors as $err): ?>
                <div><?php echo htmlspecialchars($err); ?></div>
            <?php endforeach; ?>
        </div>
    <?php endif; ?>

    <button type="button" class="btn btn-success mb-3 mt-4" data-bs-toggle="modal" data-bs-target="#addFarmerModal">
        <i class="bi bi-person-plus-fill"></i> Add Farmer
    </button>

    <div class="card mt-3 p-4">

        <div class="card-header-row">
            <h4><i class="bi bi-people"></i> Farmer Accounts</h4>
        </div>

        <hr>

        <div class="table-responsive">
            <table class="table farmers-table" id="farmersTable">
                <thead>
                    <tr>
                        <th>Full Name</th>
                        <th>Username</th>
                        <th>Address</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Date Added</th>
                    </tr>
                </thead>
                <tbody>
                    <?php if (mysqli_num_rows($farmers) === 0): ?>
                        <tr><td colspan="6" class="text-center text-muted">No farmer accounts yet.</td></tr>
                    <?php else: ?>
                        <?php while ($f = mysqli_fetch_assoc($farmers)): ?>
                            <?php $initial = $f['fullname'] !== '' ? mb_strtoupper(mb_substr($f['fullname'], 0, 1)) : '?'; ?>
                            <tr>
                                <td data-label="Full Name">
                                    <div class="farmer-name-cell">
                                        <span class="farmer-avatar"><?php echo htmlspecialchars($initial); ?></span>
                                        <span class="cell-text farmer-name-text"><?php echo htmlspecialchars($f['fullname']); ?></span>
                                    </div>
                                </td>
                                <td data-label="Username"><span class="cell-text"><?php echo htmlspecialchars($f['username']); ?></span></td>
                                <td data-label="Address"><span class="cell-text"><?php echo htmlspecialchars($f['address'] ?: '—'); ?></span></td>
                                <td data-label="Email"><span class="cell-text"><?php echo htmlspecialchars($f['email'] ?: '—'); ?></span></td>
                                <td data-label="Phone"><span class="cell-text"><?php echo htmlspecialchars($f['phone'] ?: '—'); ?></span></td>
                                <td data-label="Date Added"><span class="cell-text"><?php echo htmlspecialchars($f['created_at']); ?></span></td>
                            </tr>
                        <?php endwhile; ?>
                    <?php endif; ?>
                </tbody>
            </table>
        </div>

    </div>

</div>

</div>

<!-- Add Farmer Modal -->
<div class="modal fade" id="addFarmerModal" tabindex="-1">
    <div class="modal-dialog">
        <div class="modal-content">
            <form action="farmers.php" method="POST">
                <input type="hidden" name="action" value="add_farmer">

                <div class="modal-header">
                    <h5><i class="bi bi-person-plus-fill"></i> Add Farmer</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>

                <div class="modal-body">
                    <div class="mb-2">
                        <label class="form-label">Full Name</label>
                        <input type="text" name="fullname" class="form-control" required>
                    </div>
                    <div class="mb-2">
                        <label class="form-label">Username</label>
                        <input type="text" name="username" class="form-control" required>
                    </div>
                    <div class="mb-2">
                        <label class="form-label">Password</label>
                        <input type="password" name="password" class="form-control" required>
                    </div>
                    <div class="mb-2">
                        <label class="form-label">Email</label>
                        <input type="email" name="email" class="form-control">
                    </div>
                    <div class="mb-2">
                        <label class="form-label">Phone</label>
                        <input type="text" name="phone" class="form-control">
                    </div>
                    <div class="mb-2">
                        <label class="form-label">Farm Name</label>
                        <input type="text" name="farm_name" class="form-control">
                    </div>
                    <div class="mb-2">
                        <label class="form-label">Address</label>
                        <textarea name="address" class="form-control" rows="2"></textarea>
                    </div>
                </div>

                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                    <button type="submit" class="btn btn-success">Save Farmer</button>
                </div>
            </form>
        </div>
    </div>
</div>

<?php include "footer.php"; ?>