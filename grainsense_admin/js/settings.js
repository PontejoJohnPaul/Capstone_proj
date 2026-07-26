document.addEventListener("DOMContentLoaded", function () {

    const passwordForm = document.getElementById("passwordForm");
    const newPassword = document.getElementById("new_password");
    const confirmPassword = document.getElementById("confirm_password");
    const mismatchWarning = document.getElementById("passwordMismatch");

    function checkPasswordMatch() {
        if (confirmPassword.value && newPassword.value !== confirmPassword.value) {
            mismatchWarning.classList.remove("d-none");
            confirmPassword.setCustomValidity("Mismatch");
        } else {
            mismatchWarning.classList.add("d-none");
            confirmPassword.setCustomValidity("");
        }
    }

    if (newPassword && confirmPassword) {
        newPassword.addEventListener("input", checkPasswordMatch);
        confirmPassword.addEventListener("input", checkPasswordMatch);
    }

    if (passwordForm) {
        passwordForm.addEventListener("submit", function (e) {
            if (newPassword.value !== confirmPassword.value) {
                e.preventDefault();
                checkPasswordMatch();
            }
        });
    }

    // ===== Generic confirmation modal for Profile + Threshold forms =====
    const confirmModalEl = document.getElementById("genericConfirmModal");
    if (!confirmModalEl) return;

    const confirmModal = new bootstrap.Modal(confirmModalEl);
    const confirmTitleEl = document.getElementById("genericConfirmTitle");
    const confirmMsgEl = document.getElementById("genericConfirmMsg");
    const proceedBtn = document.getElementById("genericConfirmProceedBtn");

    let formToSubmit = null;

    document.querySelectorAll("form.needs-confirm").forEach(function (form) {
        form.addEventListener("submit", function (e) {
            // If the browser's own validation already caught something
            // (required fields, min values, etc.), let it show natively.
            if (!form.checkValidity()) {
                return;
            }

            e.preventDefault();

            formToSubmit = form;
            confirmTitleEl.textContent = form.getAttribute("data-confirm-title") || "Are you sure?";
            confirmMsgEl.textContent = form.getAttribute("data-confirm-msg") || "";

            confirmModal.show();
        });
    });

    proceedBtn.addEventListener("click", function () {
        confirmModal.hide();
        if (formToSubmit) {
            formToSubmit.submit();
        }
    });

});