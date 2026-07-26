(function () {

const DASHBOARD_ENDPOINT = "../api/get_dashboard.php";
const REFRESH_INTERVAL_MS = 2000;

// Holds the most recent sensors payload + the currently selected
// filter, so the dropdown can re-render the table locally without
// needing another fetch. updateSensorTable() itself is untouched.
let latestSensors = [];
let currentSensorFilter = "all";

function loadDashboard() {

    fetch(DASHBOARD_ENDPOINT)

        .then(response => {

            if (!response.ok) {
                throw new Error(
                    "HTTP error " + response.status + " (" + response.statusText + ")"
                );
            }

            return response.json();

        })

        .then(data => {

            if (!data || data.success !== true) {
                console.error("GrainSense Dashboard: API returned success=false", data);
                return;
            }

            updateCards(data.cards);
            latestSensors = Array.isArray(data.sensors) ? data.sensors : [];
            renderFilteredSensorTable();
            updateSensorCounts(data.sensors);

        })

        .catch(error => {

            // Requirement: fetch errors must be printed to console
            console.error("GrainSense Dashboard: failed to load dashboard data ->", error);

        });

}

function updateCards(cards) {

    if (!cards) return;

    const temperatureEl = document.getElementById("cardTemperature");
    const humidityEl = document.getElementById("cardHumidity");
    const moistureEl = document.getElementById("cardMoisture");
    const lastUpdateEl = document.getElementById("lastUpdate");

    if (temperatureEl) {
        temperatureEl.innerHTML = (cards.temperature !== null && cards.temperature !== undefined)
            ? formatNumber(cards.temperature) + " °C"
            : "-- °C";
    }

    if (humidityEl) {
        humidityEl.innerHTML = (cards.humidity !== null && cards.humidity !== undefined)
            ? formatNumber(cards.humidity) + " %"
            : "-- %";
    }

    if (moistureEl) {
        moistureEl.innerHTML = (cards.moisture !== null && cards.moisture !== undefined)
            ? formatNumber(cards.moisture) + " %"
            : "-- %";
    }

    if (lastUpdateEl) {
        lastUpdateEl.innerHTML = cards.last_update ? cards.last_update : "--";
    }

}

function updateSensorTable(sensors) {

    const tableBody = document.getElementById("sensorTable");

    if (!tableBody) return;

    if (!Array.isArray(sensors) || sensors.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="3" class="text-center text-muted">No sensors found</td>
            </tr>
        `;
        return;
    }

    let html = "";

    sensors.forEach(sensor => {

        const isDHT = sensor.sensor_type === "DHT";

        // FIX: status now comes directly from the backend
        // ("online" / "no_signal" / "disabled") instead of
        // being guessed from enabled + presence of values.
        // This is what lets us tell "actually reporting"
        // apart from "enabled but stale/disconnected".
        const status = sensor.status;

        let icon = isDHT
            ? "bi-thermometer-half text-danger"
            : "bi-moisture text-success";

        let reading;
        let statusBadge;

        if (status === "disabled") {

            reading = "OFF";
            statusBadge = `<span class="badge bg-secondary">Disabled</span>`;
            icon = isDHT
                ? "bi-thermometer-half text-muted"
                : "bi-moisture text-muted";

        } else if (status === "no_signal") {

            // Enabled, but no fresh reading -> likely unplugged/disconnected.
            // Do NOT show the old value here, it would be misleading.
            reading = "No Signal";
            statusBadge = `<span class="badge bg-warning text-dark">No Signal</span>`;
            icon = isDHT
                ? "bi-thermometer-half text-muted"
                : "bi-moisture text-muted";

        } else if (isDHT) {

            const temp = (sensor.temperature !== null && sensor.temperature !== undefined)
                ? formatNumber(sensor.temperature)
                : "--";

            const hum = (sensor.humidity !== null && sensor.humidity !== undefined)
                ? formatNumber(sensor.humidity)
                : "--";

            reading = temp + "°C / " + hum + "%";
            statusBadge = `<span class="badge bg-success">Online</span>`;

        } else {

            const moisture = (sensor.moisture !== null && sensor.moisture !== undefined)
                ? formatNumber(sensor.moisture)
                : "--";

            reading = moisture + "%";
            statusBadge = `<span class="badge bg-success">Online</span>`;

        }

        html += `
            <tr>

                <td>
                    <i class="bi ${icon}"></i>
                    ${sensor.sensor_code}
                </td>

                <td>
                    ${reading}
                </td>

                <td>
                    ${statusBadge}
                </td>

            </tr>
        `;

    });

    tableBody.innerHTML = html;

}

function updateSensorCounts(sensors) {

    const totalEl = document.getElementById("cardTotalSensors");
    const onlineEl = document.getElementById("cardOnlineSensors");
    const noSignalEl = document.getElementById("cardNoSignalSensors");
    const disabledEl = document.getElementById("cardDisabledSensors");

    if (!Array.isArray(sensors)) {
        return;
    }

    const total = sensors.length;
    const online = sensors.filter(s => s.status === "online").length;
    const noSignal = sensors.filter(s => s.status === "no_signal").length;
    const disabled = sensors.filter(s => s.status === "disabled").length;

    if (totalEl) totalEl.innerHTML = total;
    if (onlineEl) onlineEl.innerHTML = online;
    if (noSignalEl) noSignalEl.innerHTML = noSignal;
    if (disabledEl) disabledEl.innerHTML = disabled;

}

function renderFilteredSensorTable() {

    const filtered = (currentSensorFilter === "all")
        ? latestSensors
        : latestSensors.filter(sensor => sensor.status === currentSensorFilter);

    updateSensorTable(filtered);

}

function initSensorFilter() {

    const filterEl = document.getElementById("sensorFilter");

    if (!filterEl) return;

    filterEl.addEventListener("change", () => {
        currentSensorFilter = filterEl.value;
        renderFilteredSensorTable();
    });

}

function formatNumber(value) {

    const num = Number(value);

    if (Number.isNaN(num)) return value;

    return Number.isInteger(num) ? num.toString() : num.toFixed(1);

}


//===========================
// Load Immediately
//===========================

initSensorFilter();
loadDashboard();


//===========================
// Auto Refresh every 2 sec
// (setInterval, no page reload)
//===========================

setInterval(loadDashboard, REFRESH_INTERVAL_MS);

})();