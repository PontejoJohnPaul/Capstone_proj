// sensors.js — small UX helpers for Sensor Management page

document.addEventListener("DOMContentLoaded", function () {

    // Confirm before disabling a sensor
    document.querySelectorAll('form[action="remove_sensor.php"]').forEach(function (form) {
        form.addEventListener("submit", function (e) {
            const confirmed = confirm("Disable this sensor? Hihinto ang pagbasa ng data nito.");
            if (!confirmed) {
                e.preventDefault();
            }
        });
    });

    // Reset the "Enable Sensor" dropdown every time the modal opens
    const addSensorModal = document.getElementById("addSensorModal");
    if (addSensorModal) {
        addSensorModal.addEventListener("show.bs.modal", function () {
            const select = addSensorModal.querySelector('select[name="sensor_id"]');
            if (select) {
                select.selectedIndex = 0;
            }
        });
    }

});