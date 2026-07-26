<?php
/**
 * get_alerts.php
 *
 * Returns a MERGED, unified alerts feed for the mobile app's Alerts screen:
 *
 *   1. Real-time AI alerts (ai_analysis) -- SAFE/WARNING/DANGER, filterable
 *      via the `severity` query param (comma-separated list, default is
 *      all three so SAFE is now included by default).
 *
 *   2. Historical AI reports (batch_results.notes) -- the Root Cause
 *      Analysis generated after a moisture sensor is disabled with
 *      infested/damaged sacks > 0. The notes text is parsed back into
 *      the same 4 sections written by api/historical_ai.py. These are
 *      always DANGER-tier (that's the only time they exist), so they
 *      only appear when DANGER is included in the severity filter.
 *
 * Query params (all optional):
 *   severity - comma-separated subset of SAFE,WARNING,DANGER
 *              (default: SAFE,WARNING,DANGER -- everything)
 *   day      - 1-31, filters by day-of-month of the alert's timestamp
 *   month    - 1-12
 *   year     - e.g. 2026
 *
 * Both sources are normalized into the same shape (see AlertItem on the
 * mobile side) with a "source" field ('realtime' | 'historical') so the
 * UI can render them in a single unread/read list and tag them accordingly.
 */

header("Content-Type: application/json");

include "../config/database.php";

// =========================================================
// Filters
// =========================================================

$severityParam = isset($_GET['severity']) ? strtoupper($_GET['severity']) : 'SAFE,WARNING,DANGER';
$allowedSeverities = array_values(array_intersect(
    array_map('trim', explode(',', $severityParam)),
    ['SAFE', 'WARNING', 'DANGER']
));
if (empty($allowedSeverities)) {
    $allowedSeverities = ['SAFE', 'WARNING', 'DANGER'];
}
// Safe to inline: every entry came from the whitelist above.
$severityList = "'" . implode("','", $allowedSeverities) . "'";

$day   = (isset($_GET['day'])   && ctype_digit($_GET['day']))   ? (int) $_GET['day']   : null;
$month = (isset($_GET['month']) && ctype_digit($_GET['month'])) ? (int) $_GET['month'] : null;
$year  = (isset($_GET['year'])  && ctype_digit($_GET['year']))  ? (int) $_GET['year']  : null;

$alerts = [];
$unreadCount = 0;

// =========================================================
// 1) Real-time AI alerts -- filtered by $severityList
// =========================================================

$rtDateWhere = "";
if ($day !== null)   $rtDateWhere .= " AND DAY(created_at) = $day";
if ($month !== null) $rtDateWhere .= " AND MONTH(created_at) = $month";
if ($year !== null)  $rtDateWhere .= " AND YEAR(created_at) = $year";

$rtSql = "
    SELECT
        analysis_id, batch_id, status, predicted_pest,
        possible_cause, recommendation, is_read, created_at
    FROM ai_analysis
    WHERE status IN ($severityList) $rtDateWhere
    ORDER BY created_at DESC
";

$rtResult = mysqli_query($conn, $rtSql);

if (!$rtResult) {
    echo json_encode(["success" => false, "message" => "Failed to load alerts: " . mysqli_error($conn)]);
    exit;
}

while ($row = mysqli_fetch_assoc($rtResult)) {

    $isRead = ((int) $row["is_read"]) === 1;
    if (!$isRead) {
        $unreadCount++;
    }

    $alerts[] = [
        "id"             => "rt-" . $row["analysis_id"],
        "source_id"      => (int) $row["analysis_id"],
        "source"         => "realtime",
        "batch_id"       => (int) $row["batch_id"],
        "status"         => $row["status"], // WARNING | DANGER
        "title"          => $row["predicted_pest"],
        "subtitle"       => $row["possible_cause"],
        "extra"          => null,
        "recommendation" => $row["recommendation"],
        "is_read"        => $isRead,
        "created_at"     => $row["created_at"],
    ];
}

// =========================================================
// 2) Historical AI reports (Root Cause Analysis)
//    Always DANGER-tier -- only fetched when DANGER is allowed.
// =========================================================

if (in_array('DANGER', $allowedSeverities, true)) {

    $histDateWhere = "";
    if ($day !== null)   $histDateWhere .= " AND DAY(br.finished_at) = $day";
    if ($month !== null) $histDateWhere .= " AND MONTH(br.finished_at) = $month";
    if ($year !== null)  $histDateWhere .= " AND YEAR(br.finished_at) = $year";

    $histSql = "
        SELECT
            br.result_id, br.batch_id, br.notes, br.is_read, br.finished_at
        FROM batch_results br
        WHERE br.notes IS NOT NULL $histDateWhere
        ORDER BY br.finished_at DESC
    ";

    $histResult = mysqli_query($conn, $histSql);

    if (!$histResult) {
        echo json_encode(["success" => false, "message" => "Failed to load historical alerts: " . mysqli_error($conn)]);
        exit;
    }

    while ($row = mysqli_fetch_assoc($histResult)) {

        $isRead = ((int) $row["is_read"]) === 1;
        if (!$isRead) {
            $unreadCount++;
        }

        $parsed = parse_historical_notes($row["notes"]);

        $alerts[] = [
            "id"             => "hist-" . $row["result_id"],
            "source_id"      => (int) $row["result_id"],
            "source"         => "historical",
            "batch_id"       => (int) $row["batch_id"],
            "status"         => "DANGER", // finished batches here always had infested sacks
            "title"          => $parsed["likely_pests"] ?: "Root Cause Analysis",
            "subtitle"       => $parsed["root_cause"],
            "extra"          => $parsed["contributing_conditions"],
            "recommendation" => $parsed["recommendation"],
            "is_read"        => $isRead,
            "created_at"     => $row["finished_at"],
        ];
    }
}

// =========================================================
// Merge + sort newest first
// =========================================================

usort($alerts, function ($a, $b) {
    return strtotime($b["created_at"]) <=> strtotime($a["created_at"]);
});

echo json_encode([
    "success"      => true,
    "unread_count" => $unreadCount,
    "alerts"       => $alerts,
]);

/**
 * Parses the notes text written by api/historical_ai.py:
 *
 *   LIKELY PEST(S): ...
 *
 *   ROOT CAUSE: ...
 *
 *   CONTRIBUTING CONDITIONS: ...
 *
 *   RECOMMENDATION: ...
 *
 * Falls back gracefully (nulls) if the format ever changes -- the
 * frontend already handles null fields as "N/A".
 */
function parse_historical_notes($notes) {

    $result = [
        "likely_pests"            => null,
        "root_cause"               => null,
        "contributing_conditions"  => null,
        "recommendation"           => null,
    ];

    $sections = explode("\n\n", trim($notes));

    foreach ($sections as $section) {
        if (preg_match('/^LIKELY PEST\(S\):\s*(.*)$/s', $section, $m)) {
            $result["likely_pests"] = trim($m[1]);
        } elseif (preg_match('/^ROOT CAUSE:\s*(.*)$/s', $section, $m)) {
            $result["root_cause"] = trim($m[1]);
        } elseif (preg_match('/^CONTRIBUTING CONDITIONS:\s*(.*)$/s', $section, $m)) {
            $result["contributing_conditions"] = trim($m[1]);
        } elseif (preg_match('/^RECOMMENDATION:\s*(.*)$/s', $section, $m)) {
            $result["recommendation"] = trim($m[1]);
        }
    }

    return $result;
}