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

  if (!burgerBtn || !mobileMenu) return;

  burgerBtn.addEventListener("click", () => {
    mobileMenu.classList.toggle("hidden");
  });

  mobileMenu.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      mobileMenu.classList.add("hidden");
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initNavbar();
  updateNavbar();
});
