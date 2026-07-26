<?php include "header.php"; ?>

<div class="wrapper">

<?php include "sidebar.php"; ?>

<div class="content">

    <div class="topbar">
        <h2>System Logs</h2>
    </div>

    <div class="card mt-4 p-4">

        <h4><i class="bi bi-clock-history"></i> Activity Logs</h4>

        <hr>

        <?php

        require_once("../config/database.php");

        // ===== Filters =====
        $dateFrom = $_GET['date_from'] ?? '';
        $dateTo   = $_GET['date_to'] ?? '';
        $selectedActions = $_GET['actions'] ?? [];  // array of action codes

        $allActions = [
            'LOGIN_SUCCESS'     => 'Login',
            'LOGIN_FAILED'      => 'Login Failed',
            'LOGOUT'            => 'Logout',
            'SENSOR_ENABLED'    => 'Sensor Enabled',
            'SENSOR_DISABLED'   => 'Sensor Disabled',
            'SENSOR_ADDED'      => 'Sensor Added',
            'SENSOR_REMOVED'    => 'Sensor Removed',
            'PROFILE_UPDATED'   => 'Profile Updated',
            'PASSWORD_CHANGED'  => 'Password Changed',
            'THRESHOLD_UPDATED' => 'Threshold Updated',
        ];

        // ===== Build WHERE clause dynamically =====
        $where = [];
        $params = [];
        $types = '';

        if ($dateFrom !== '') {
            $where[] = "DATE(created_at) >= ?";
            $params[] = $dateFrom;
            $types .= 's';
        }

        if ($dateTo !== '') {
            $where[] = "DATE(created_at) <= ?";
            $params[] = $dateTo;
            $types .= 's';
        }

        if (!empty($selectedActions)) {
            $placeholders = implode(',', array_fill(0, count($selectedActions), '?'));
            $where[] = "action IN ($placeholders)";
            foreach ($selectedActions as $a) {
                $params[] = $a;
                $types .= 's';
            }
        }

        $whereSql = !empty($where) ? "WHERE " . implode(" AND ", $where) : "";

        // ===== Pagination setup =====
        $perPage = 10;
        $page = isset($_GET['page']) && ctype_digit($_GET['page']) ? (int)$_GET['page'] : 1;
        if ($page < 1) $page = 1;
        $offset = ($page - 1) * $perPage;

        // ===== Count total rows (for pagination) =====
        $countSql = "SELECT COUNT(*) AS total FROM system_logs $whereSql";
        $countStmt = mysqli_prepare($conn, $countSql);
        if (!empty($params)) {
            mysqli_stmt_bind_param($countStmt, $types, ...$params);
        }
        mysqli_stmt_execute($countStmt);
        $countResult = mysqli_stmt_get_result($countStmt);
        $totalRows = mysqli_fetch_assoc($countResult)['total'] ?? 0;
        mysqli_stmt_close($countStmt);

        $totalPages = max(1, ceil($totalRows / $perPage));
        if ($page > $totalPages) $page = $totalPages;
        $offset = ($page - 1) * $perPage;

        // ===== Fetch page of logs =====
        $sql = "
            SELECT username, action, description, created_at
            FROM system_logs
            $whereSql
            ORDER BY log_id DESC
            LIMIT ? OFFSET ?
        ";
        $stmt = mysqli_prepare($conn, $sql);

        $fullTypes = $types . 'ii';
        $fullParams = array_merge($params, [$perPage, $offset]);
        mysqli_stmt_bind_param($stmt, $fullTypes, ...$fullParams);
        mysqli_stmt_execute($stmt);
        $result = mysqli_stmt_get_result($stmt);

        // Helper to rebuild query string while keeping filters, only changing "page"
        function buildPageUrl($page, $dateFrom, $dateTo, $selectedActions) {
            $params = ['page' => $page];
            if ($dateFrom !== '') $params['date_from'] = $dateFrom;
            if ($dateTo !== '') $params['date_to'] = $dateTo;
            $query = http_build_query($params);
            foreach ($selectedActions as $a) {
                $query .= '&actions[]=' . urlencode($a);
            }
            return 'system_logs.php?' . $query;
        }

        ?>

        <!-- ===== Filter Form ===== -->
        <form method="GET" action="system_logs.php" class="row g-2 align-items-end mb-4">

            <div class="col-auto">
                <label class="form-label mb-1 small text-muted">From</label>
                <input type="date" name="date_from" class="form-control form-control-sm"
                    value="<?php echo htmlspecialchars($dateFrom); ?>">
            </div>

            <div class="col-auto">
                <label class="form-label mb-1 small text-muted">To</label>
                <input type="date" name="date_to" class="form-control form-control-sm"
                    value="<?php echo htmlspecialchars($dateTo); ?>">
            </div>

            <div class="col-auto">
                <label class="form-label mb-1 small text-muted d-block">Action</label>
                <div class="dropdown">
                    <button class="btn btn-sm btn-outline-secondary dropdown-toggle" type="button"
                        data-bs-toggle="dropdown">
                        <?php echo empty($selectedActions) ? 'All Actions' : count($selectedActions) . ' selected'; ?>
                    </button>
                    <ul class="dropdown-menu p-2" style="min-width: 220px;">
                        <?php foreach ($allActions as $code => $label): ?>
                            <li>
                                <div class="form-check">
                                    <input
                                        class="form-check-input"
                                        type="checkbox"
                                        name="actions[]"
                                        value="<?php echo $code; ?>"
                                        id="filter_<?php echo $code; ?>"
                                        <?php echo in_array($code, $selectedActions) ? 'checked' : ''; ?>>
                                    <label class="form-check-label" for="filter_<?php echo $code; ?>">
                                        <?php echo $label; ?>
                                    </label>
                                </div>
                            </li>
                        <?php endforeach; ?>
                    </ul>
                </div>
            </div>

            <div class="col-auto">
                <button type="submit" class="btn btn-sm btn-success">
                    <i class="bi bi-funnel"></i> Filter
                </button>
                <a href="system_logs.php" class="btn btn-sm btn-outline-secondary">Reset</a>
            </div>

        </form>

        <div class="table-responsive">

            <table class="table">

                <thead>
                    <tr>
                        <th>Date & Time</th>
                        <th>User</th>
                        <th>Action</th>
                        <th>Description</th>
                    </tr>
                </thead>

                <tbody>

                    <?php if ($result && mysqli_num_rows($result) > 0): ?>

                        <?php while ($log = mysqli_fetch_assoc($result)): ?>

                            <?php
                            $action = $log['action'];

                            if (in_array($action, ['LOGIN_SUCCESS', 'SENSOR_ENABLED', 'SENSOR_ADDED', 'PROFILE_UPDATED', 'PASSWORD_CHANGED', 'THRESHOLD_UPDATED'])) {
                                $badgeClass = 'bg-success';
                            } elseif (in_array($action, ['LOGIN_FAILED', 'SENSOR_REMOVED'])) {
                                $badgeClass = 'bg-danger';
                            } elseif (in_array($action, ['LOGOUT', 'SENSOR_DISABLED'])) {
                                $badgeClass = 'bg-secondary';
                            } else {
                                $badgeClass = 'bg-info';
                            }
                            ?>

                            <tr>
                                <td><?php echo htmlspecialchars($log['created_at']); ?></td>
                                <td><?php echo htmlspecialchars($log['username'] ?? '—'); ?></td>
                                <td><span class="badge <?php echo $badgeClass; ?>"><?php echo htmlspecialchars($action); ?></span></td>
                                <td><?php echo htmlspecialchars($log['description']); ?></td>
                            </tr>

                        <?php endwhile; ?>

                    <?php else: ?>

                        <tr><td colspan="4" class="text-center text-muted">No logs found</td></tr>

                    <?php endif; ?>

                </tbody>

            </table>

        </div>

        <!-- ===== Pagination ===== -->
        <?php if ($totalPages > 1): ?>
        <nav class="mt-3">
            <ul class="pagination justify-content-end pagination-sm mb-0">

                <li class="page-item <?php echo $page <= 1 ? 'disabled' : ''; ?>">
                    <a class="page-link" href="<?php echo buildPageUrl(max(1, $page - 1), $dateFrom, $dateTo, $selectedActions); ?>">Previous</a>
                </li>

                <?php for ($i = 1; $i <= $totalPages; $i++): ?>
                    <li class="page-item <?php echo $i === $page ? 'active' : ''; ?>">
                        <a class="page-link" href="<?php echo buildPageUrl($i, $dateFrom, $dateTo, $selectedActions); ?>"><?php echo $i; ?></a>
                    </li>
                <?php endfor; ?>

                <li class="page-item <?php echo $page >= $totalPages ? 'disabled' : ''; ?>">
                    <a class="page-link" href="<?php echo buildPageUrl(min($totalPages, $page + 1), $dateFrom, $dateTo, $selectedActions); ?>">Next</a>
                </li>

            </ul>
        </nav>
        <?php endif; ?>

    </div>

</div>

</div>

<?php include "footer.php"; ?>