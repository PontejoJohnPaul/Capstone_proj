<?php
if (session_status() == PHP_SESSION_NONE) {
    session_start();
}
include "header.php";
?>
<?php
include "../config/database.php";

// Lahat ng kasalukuyang nakadisplay sa Sensor Management (hindi pa removed)
$result = mysqli_query($conn, "SELECT * FROM sensors WHERE removed = 0 ORDER BY sensor_type, sensor_code");

$errorMsg = $_SESSION['error'] ?? null;
$successMsg = $_SESSION['success'] ?? null;
unset($_SESSION['error'], $_SESSION['success']);
?>

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
.confirm-card .confirm-icon.remove {
    background: #fdeaea;
    color: #c0392b;
}
.confirm-card .modal-footer .btn {
    min-width: 110px;
    border-radius: 10px;
}
.sensor-card .card-body .d-flex.justify-content-between {
    align-items: flex-start;
}
.sensor-card .card-body h5 {
    flex: 1 1 auto;
    min-width: 0;
    margin-bottom: 0;
}
.sensor-card .card-body .badge {
    white-space: nowrap;
    flex-shrink: 0;
    margin-left: .5rem;
}
</style>

<div class="wrapper">

    <?php include "sidebar.php"; ?>

    <div class="content">

        <div class="d-flex justify-content-between align-items-center mb-4">
            <div>
                <h2 class="fw-bold">Sensor Management</h2>
                <p class="text-muted mb-0">Manage all installed sensors</p>
            </div>

            <button class="btn btn-success" data-bs-toggle="modal" data-bs-target="#addSensorModal">
                <i class="bi bi-plus-circle"></i>
                Add Sensor
            </button>
        </div>

        <?php if ($errorMsg): ?>
            <div class="alert alert-danger"><?php echo htmlspecialchars($errorMsg); ?></div>
        <?php endif; ?>

        <div class="sensor-toolbar">

            <div class="sensor-search-box">
                <i class="bi bi-search"></i>
                <input
                    type="text"
                    id="sensorSearchInput"
                    placeholder="Search by name or code...">
            </div>

            <div class="sensor-status-filter" id="sensorStatusFilter">
                <button type="button" class="status-filter-btn active" data-status="all">All</button>
                <button type="button" class="status-filter-btn" data-status="enabled">Enabled</button>
                <button type="button" class="status-filter-btn" data-status="disabled">Disabled</button>
            </div>

        </div>

        <div class="row" id="sensorCardGrid">

            <?php while ($sensor = mysqli_fetch_assoc($result)): ?>

                <div class="col-lg-4 col-md-6 mb-4 sensor-card-col"
                    data-sensor-name="<?php echo htmlspecialchars(strtolower($sensor['sensor_name'] ?: $sensor['sensor_code'])); ?>"
                    data-sensor-code="<?php echo htmlspecialchars(strtolower($sensor['sensor_code'])); ?>"
                    data-sensor-status="<?php echo $sensor['enabled'] ? 'enabled' : 'disabled'; ?>">
                    <div class="card sensor-card">
                        <div class="card-body">

                            <div class="d-flex justify-content-between">
                                <h5>
                                    <?php echo $sensor['sensor_type'] === 'DHT' ? '🌡' : '🌾'; ?>
                                    <?php echo htmlspecialchars($sensor['sensor_name'] ?: $sensor['sensor_code']); ?>
                                </h5>

                                <span class="badge <?php echo $sensor['enabled'] ? 'bg-success' : 'bg-secondary'; ?>">
                                    <?php echo $sensor['enabled'] ? 'Enabled' : 'Disabled'; ?>
                                </span>
                            </div>

                            <hr>

                            <p class="mb-1"><strong>Code:</strong> <?php echo htmlspecialchars($sensor['sensor_code']); ?></p>
                            <p class="mb-1"><strong>Pin:</strong> <?php echo htmlspecialchars($sensor['gpio_pin']); ?></p>
                            <p class="mb-1"><strong>Type:</strong> <?php echo $sensor['sensor_type'] === 'DHT' ? 'DHT22 (Temp & Humidity)' : 'Moisture'; ?></p>

                            <div class="mt-4 d-grid gap-2">

                                <?php if ($sensor['enabled']): ?>
                                    <form action="remove_sensor.php" method="POST">
                                        <input type="hidden" name="sensor_id" value="<?php echo $sensor['sensor_id']; ?>">
                                        <input type="hidden" name="action" value="disable">
                                        <button class="btn btn-warning w-100">Disable</button>
                                    </form>
                                <?php else: ?>
                                    <form action="add_sensor.php" method="POST">
                                        <input type="hidden" name="sensor_id" value="<?php echo $sensor['sensor_id']; ?>">
                                        <input type="hidden" name="action" value="enable">
                                        <button class="btn btn-success w-100">Enable</button>
                                    </form>
                                <?php endif; ?>

                                <button
                                    type="button"
                                    class="btn btn-danger w-100 btn-remove-sensor"
                                    data-sensor-id="<?php echo $sensor['sensor_id']; ?>"
                                    data-sensor-name="<?php echo htmlspecialchars($sensor['sensor_name'] ?: $sensor['sensor_code']); ?>"
                                    <?php echo $sensor['enabled'] ? 'disabled title="I-disable muna bago i-remove"' : ''; ?>>
                                    Remove
                                </button>

                            </div>

                        </div>
                    </div>
                </div>

            <?php endwhile; ?>

        </div>

        <div id="noSensorResults" class="text-center text-muted py-5" style="display:none;">
            <i class="bi bi-search" style="font-size:1.5rem;"></i>
            <p class="mb-0 mt-2">No sensors match your search/filter.</p>
        </div>

    </div>

    <?php include "add_sensor.php"; ?>
    <?php include "remove_sensor.php"; ?>

    <!-- Success Card -->
    <?php if ($successMsg): ?>
    <div class="modal fade confirm-card" id="successModal" tabindex="-1">
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
    <?php endif; ?>

</div>

<script>
document.addEventListener("DOMContentLoaded", function () {

    // REMOVE: pakuha ng sensor id/name papunta sa confirmation card
    document.querySelectorAll(".btn-remove-sensor").forEach(function (btn) {
        btn.addEventListener("click", function () {
            const id = btn.getAttribute("data-sensor-id");
            const name = btn.getAttribute("data-sensor-name");
            document.getElementById("removeSensorId").value = id;
            document.getElementById("removeSensorName").textContent = name;

            const modal = new bootstrap.Modal(document.getElementById("removeSensorModal"));
            modal.show();
        });
    });

    // ADD: kapag pinindot ang "Add Sensor" sa loob ng select-modal, ililipat sa confirmation card
    const addSensorNextBtn = document.getElementById("addSensorNextBtn");
    const addSensorSelect = document.getElementById("addSensorSelect");
    const addSensorModalEl = document.getElementById("addSensorModal");

    addSensorNextBtn.addEventListener("click", function () {
        if (!addSensorSelect.value) {
            addSensorSelect.reportValidity();
            return;
        }

        const selectedOption = addSensorSelect.options[addSensorSelect.selectedIndex];
        const id = selectedOption.value;
        const name = selectedOption.getAttribute("data-name");

        document.getElementById("confirmAddSensorId").value = id;
        document.getElementById("confirmAddSensorName").textContent = name;

        // Itago muna yung select modal, ipakita yung confirmation card
        const addModal = bootstrap.Modal.getOrCreateInstance(addSensorModalEl);
        addModal.hide();

        addSensorModalEl.addEventListener("hidden.bs.modal", function showConfirm() {
            const confirmModal = new bootstrap.Modal(document.getElementById("confirmAddModal"));
            confirmModal.show();
            addSensorModalEl.removeEventListener("hidden.bs.modal", showConfirm);
        });
    });

    <?php if ($successMsg): ?>
    // Awtomatikong ipakita ang Success card pagkatapos ng successful na action
    const successModal = new bootstrap.Modal(document.getElementById("successModal"));
    successModal.show();
    <?php endif; ?>

    // ===== Search + Status Filter (client-side) =====

    const searchInput = document.getElementById("sensorSearchInput");
    const statusButtons = document.querySelectorAll(".status-filter-btn");
    const cardCols = document.querySelectorAll(".sensor-card-col");
    const noResultsEl = document.getElementById("noSensorResults");

    let currentStatus = "all";

    function applySensorFilters() {

        const query = searchInput ? searchInput.value.trim().toLowerCase() : "";

        let visibleCount = 0;

        cardCols.forEach(function (col) {

            const name = col.getAttribute("data-sensor-name") || "";
            const code = col.getAttribute("data-sensor-code") || "";
            const cardStatus = col.getAttribute("data-sensor-status") || "";

            const matchesSearch = !query || name.includes(query) || code.includes(query);
            const matchesStatus = (currentStatus === "all") || (cardStatus === currentStatus);

            const isVisible = matchesSearch && matchesStatus;
            col.style.display = isVisible ? "" : "none";

            if (isVisible) {
                visibleCount++;
            }

        });

        if (noResultsEl) {
            noResultsEl.style.display = (visibleCount === 0) ? "" : "none";
        }

    }

    if (searchInput) {
        searchInput.addEventListener("input", applySensorFilters);
    }

    statusButtons.forEach(function (btn) {
        btn.addEventListener("click", function () {

            statusButtons.forEach(function (b) {
                b.classList.remove("active");
            });
            btn.classList.add("active");

            currentStatus = btn.getAttribute("data-status");
            applySensorFilters();

        });
    });

});
</script>

<?php include "footer.php"; ?>