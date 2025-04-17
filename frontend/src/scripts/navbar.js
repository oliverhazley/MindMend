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
