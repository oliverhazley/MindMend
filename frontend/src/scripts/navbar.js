//Navbar.js
// this file handles the navbar functionality, including the burger menu for mobile devices.
// it is responsible for showing and hiding the navbar links based on the user's authentication status.
// it also includes functions to initialize the navbar and update its visibility based on the user's login status.
// it uses the lucide library for icons and requires authentication to access certain links.
// the navbar is responsive and works on both desktop and mobile devices.
// token is used to determine if the user is logged in or not.
// without a token, the user is considered logged out and the public navigation links are shown.
// with a token, the user is considered logged in and the protected navigation links are shown.
// ----------------------------------------------------------------------

export function updateNavbar() {
  const token = localStorage.getItem("token");

  const fullNav = document.querySelectorAll(".spa-protected-nav");
  const publicNav = document.querySelectorAll(".spa-public-nav");

  if (token) {
    fullNav.forEach((el) => el.classList.remove("hidden"));
    publicNav.forEach((el) => el.classList.add("hidden"));
  } else {
    fullNav.forEach((el) => el.classList.add("hidden"));
    publicNav.forEach((el) => el.classList.remove("hidden"));
  }
}

export function initNavbar() {
  const burgerBtn = document.getElementById("burgerBtn");
  const mobileMenu = document.getElementById("mobileMenu");
  const burgerIcon = document.getElementById("burgerIcon");
  const closeIcon = document.getElementById("closeIcon");

  if (!burgerBtn || !mobileMenu) return;

  burgerBtn.addEventListener("click", () => {
    const isOpen = !mobileMenu.classList.contains("hidden");
    mobileMenu.classList.toggle("hidden");

    if (isOpen) {
      // Going to closed
      burgerIcon.classList.remove("hidden");
      closeIcon.classList.add("hidden");
    } else {
      // Going to open
      burgerIcon.classList.add("hidden");
      closeIcon.classList.remove("hidden");
    }
  });

  mobileMenu.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      mobileMenu.classList.add("hidden");
      burgerIcon.classList.remove("hidden");
      closeIcon.classList.add("hidden");
    });
  });
}


document.addEventListener("DOMContentLoaded", () => {
  initNavbar();
  updateNavbar();
});
