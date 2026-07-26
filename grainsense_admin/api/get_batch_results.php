<?php
// get_batch_results.php
// Returns a paginated + filterable list of finished batch results (with AI notes)
// for a given farmer, newest first.
//
// Query params:
//   farmer_id (required)
//   page          - default 1
//   day           - 1-31, filters by day-of-month of finished_at
//   month         - 1-12, filters by month of finished_at
//   year          - e.g. 2026, filters by year of finished_at
//   sack_filter   - 'safe' (no damaged sacks) | 'damaged' (has damaged sacks)
//   moisture_filter - 'safe' (<14%) | 'high' (>=14%), based on the batch's
//                     average moisture reading during its active window

header('Content-Type: application/json');
require_once __DIR__ . '/../config/database.php';

$farmer_id = isset($_GET['farmer_id']) ? intval($_GET['farmer_id']) : 0;
if (!$farmer_id) {
    echo json_encode(['success' => false, 'message' => 'farmer_id is required']);
    exit;
}

// ---- Pagination ----
$page   = isset($_GET['page']) ? max(1, intval($_GET['page'])) : 1;
$limit  = 10;
$offset = ($page - 1) * $limit;

// ---- Dynamic WHERE clause (applied on the base rows) ----
$where  = ["b.farmer_id = ?"];
$params = [$farmer_id];
$types  = "i";

if (!empty($_GET['day']) && ctype_digit($_GET['day'])) {
    $where[]  = "DAY(br.finished_at) = ?";
    $params[] = intval($_GET['day']);
    $types   .= "i";
}

if (!empty($_GET['month']) && ctype_digit($_GET['month'])) {
    $where[]  = "MONTH(br.finished_at) = ?";
    $params[] = intval($_GET['month']);
    $types   .= "i";
}

if (!empty($_GET['year']) && ctype_digit($_GET['year'])) {
    $where[]  = "YEAR(br.finished_at) = ?";
    $params[] = intval($_GET['year']);
    $types   .= "i";
}

$sackFilter = $_GET['sack_filter'] ?? '';
if ($sackFilter === 'safe') {
    $where[] = "(br.damaged_sacks IS NULL OR br.damaged_sacks = 0)";
} elseif ($sackFilter === 'damaged') {
    $where[] = "br.damaged_sacks > 0";
}

$whereSql = implode(' AND ', $where);

// ---- Moisture filter (applied after avg_moisture is computed) ----
$moistureFilter = $_GET['moisture_filter'] ?? '';
$moistureSql = '';
if ($moistureFilter === 'safe') {
    $moistureSql = "WHERE t.avg_moisture IS NOT NULL AND t.avg_moisture < 14";
} elseif ($moistureFilter === 'high') {
    $moistureSql = "WHERE t.avg_moisture IS NOT NULL AND t.avg_moisture >= 14";
}

// Base query: one row per finished batch result, with avg moisture computed
// from sensor_readings during that batch's active window (created_at -> finished_at).
$baseQuery = "
    SELECT 
        br.result_id,
        br.batch_id,
        br.healthy_sacks,
        br.damaged_sacks,
        br.notes,
        br.is_read,
        br.finished_at,
        b.total_sacks,
        b.created_at AS batch_started_at,
        s.sensor_code,
        s.sensor_name,
        (
            SELECT AVG(sr.moisture)
            FROM sensor_readings sr
            WHERE sr.sensor_id = b.sensor_id
              AND sr.created_at BETWEEN b.created_at AND br.finished_at
        ) AS avg_moisture
    FROM batch_results br
    INNER JOIN batches b ON br.batch_id = b.batch_id
    LEFT JOIN sensors s ON b.sensor_id = s.sensor_id
    WHERE $whereSql
";

// ---- Total count (for pagination), same filters applied ----
$countSql = "SELECT COUNT(*) AS total FROM ($baseQuery) t $moistureSql";
$countStmt = $conn->prepare($countSql);
if (!$countStmt) {
    echo json_encode(['success' => false, 'message' => 'Count query failed: ' . $conn->error]);
    exit;
}
$countStmt->bind_param($types, ...$params);
$countStmt->execute();
$countRow   = $countStmt->get_result()->fetch_assoc();
$totalCount = (int) ($countRow['total'] ?? 0);
$totalPages = $totalCount > 0 ? (int) ceil($totalCount / $limit) : 1;
$countStmt->close();

// ---- Paginated data ----
$dataSql    = "SELECT t.* FROM ($baseQuery) t $moistureSql ORDER BY t.finished_at DESC LIMIT ? OFFSET ?";
$dataTypes  = $types . "ii";
$dataParams = array_merge($params, [$limit, $offset]);

$stmt = $conn->prepare($dataSql);
if (!$stmt) {
    echo json_encode(['success' => false, 'message' => 'Data query failed: ' . $conn->error]);
    exit;
}
$stmt->bind_param($dataTypes, ...$dataParams);
$stmt->execute();
$result = $stmt->get_result();

$batches = [];
while ($row = $result->fetch_assoc()) {
    $row['healthy_sacks'] = $row['healthy_sacks'] !== null ? (int) $row['healthy_sacks'] : null;
    $row['damaged_sacks'] = $row['damaged_sacks'] !== null ? (int) $row['damaged_sacks'] : null;
    $row['total_sacks']   = (int) $row['total_sacks'];
    $row['is_read']       = (int) $row['is_read'];
    $row['avg_moisture']  = $row['avg_moisture'] !== null ? round((float) $row['avg_moisture'], 1) : null;
    $batches[] = $row;
}

echo json_encode([
    'success'     => true,
    'batches'     => $batches,
    'page'        => $page,
    'limit'       => $limit,
    'total_count' => $totalCount,
    'total_pages' => $totalPages,
]);

$stmt->close();
$conn->close();