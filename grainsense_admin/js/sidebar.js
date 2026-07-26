(function () {

    const sidebar  = document.getElementById("sidebar");
    const toggleBtn = document.getElementById("sidebarToggle");
    const backdrop  = document.getElementById("sidebarBackdrop");

    // If any of these are missing (page doesn't include sidebar.php
    // for some reason), just do nothing instead of throwing errors.
    if (!sidebar || !toggleBtn || !backdrop) return;

    function openSidebar() {
        sidebar.classList.add("active");
        backdrop.classList.add("active");
        document.body.style.overflow = "hidden"; // prevent background scroll while drawer is open
    }

    function closeSidebar() {
        sidebar.classList.remove("active");
        backdrop.classList.remove("active");
        document.body.style.overflow = "";
    }

    toggleBtn.addEventListener("click", function () {
        if (sidebar.classList.contains("active")) {
            closeSidebar();
        } else {
            openSidebar();
        }
    });

    // Tap outside the sidebar (on the dimmed backdrop) to close it
    backdrop.addEventListener("click", closeSidebar);

    // Auto-close the drawer after tapping a nav link, since the
    // page is about to navigate away anyway (better mobile UX)
    const navLinks = sidebar.querySelectorAll("a");

    navLinks.forEach(function (link) {
        link.addEventListener("click", closeSidebar);
    });

    // If the window is resized/rotated back to desktop width while
    // the mobile drawer happens to be open, reset it so it doesn't
    // get stuck "open" once back on desktop layout.
    window.addEventListener("resize", function () {
        if (window.innerWidth > 992) {
            closeSidebar();
        }
    });

})();