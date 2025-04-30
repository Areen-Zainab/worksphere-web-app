document.addEventListener("DOMContentLoaded", function () {
    const menuToggle = document.querySelector(".menu-toggle");
    const nav = document.querySelector("nav");

    menuToggle.addEventListener("click", function () {
        nav.classList.toggle("active");

        // button should remain visible
        if (nav.classList.contains("active")) {
            menuToggle.classList.add("open");
        } else {
            menuToggle.classList.remove("open");
        }
    });
});
