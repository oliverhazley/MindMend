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

  let outsideClickListener;

  burgerBtn.addEventListener("click", () => {
    const isOpen = !mobileMenu.classList.contains("hidden");

    if (isOpen) {
      // Closing menu
      mobileMenu.classList.add("scale-95", "opacity-0");
      mobileMenu.classList.remove("scale-100", "opacity-100");

      setTimeout(() => {
        mobileMenu.classList.add("hidden");
      }, 150);

      burgerIcon.classList.remove("hidden");
      closeIcon.classList.add("hidden");

      // Remove outside click listener when closing
      document.removeEventListener("click", outsideClickListener);
    } else {
      // Opening menu
      mobileMenu.classList.remove("hidden");

      setTimeout(() => {
        mobileMenu.classList.remove("scale-95", "opacity-0");
        mobileMenu.classList.add("scale-100", "opacity-100");

        // ✅ Render Lucide icons inside visible menu
        if (window.lucide) window.lucide.createIcons();
      }, 10);

      burgerIcon.classList.add("hidden");
      closeIcon.classList.remove("hidden");

      // ✅ Add outside click listener to close menu
      outsideClickListener = (e) => {
        if (!mobileMenu.contains(e.target) && !burgerBtn.contains(e.target)) {
          mobileMenu.classList.add("hidden");
          burgerIcon.classList.remove("hidden");
          closeIcon.classList.add("hidden");
          document.removeEventListener("click", outsideClickListener);
        }
      };
      document.addEventListener("click", outsideClickListener);
    }
  });

  // Auto-close mobile menu when a nav link is clicked
  mobileMenu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      mobileMenu.classList.add("hidden");
      burgerIcon.classList.remove("hidden");
      closeIcon.classList.add("hidden");
      document.removeEventListener("click", outsideClickListener);
    });
  });
}

// Run navbar logic on page load
document.addEventListener("DOMContentLoaded", () => {
  initNavbar();
  updateNavbar();
});
