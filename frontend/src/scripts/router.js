// src/scripts/router.js

// ✅ Section initializers
import { initDashboard } from "./dashboard.js";
import { initChat } from "./chat.js";
import { initExercises } from "./exercises.js";
import { initTetris } from "./tetris.js";
import { initInfo } from "./info.js";
import { initSettings } from "./settings.js";
import { initLogin } from "./login.js";
import { initSignup } from "./signup.js";

// ✅ Global utilities
import { requireAuth } from "./utils.js";
import { updateNavbar } from "./navbar.js";
import { initLogout } from "./logout.js"; // ✅ Add this

// Route identifiers
const routes = [
  "dashboard",
  "chat",
  "exercises",
  "tetris",
  "info",
  "settings",
  "login",
  "signup",
];

// Show one SPA page and hide the rest
export function showPage(page) {
  document.querySelectorAll(".spa-page").forEach((section) => {
    section.classList.add("hidden");
  });

  const target = document.getElementById(`page-${page}`);
  if (target) {
    target.classList.remove("hidden");
    window.scrollTo({ top: 0 });
  } else {
    showPage("dashboard"); // fallback
  }

  // Toggle nav visibility
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

// Logic for each route
function loadPageLogic(page) {
  switch (page) {
    case "dashboard":
      if (requireAuth()) initDashboard();
      break;
    case "chat":
      if (requireAuth()) initChat();
      break;
    case "exercises":
      if (requireAuth()) initExercises();
      break;
    case "tetris":
      if (requireAuth()) initTetris();
      break;
    case "info":
      if (requireAuth()) initInfo();
      break;
    case "settings":
      if (requireAuth()) initSettings();
      break;
    case "login":
      initLogin();
      initLogout(); // ✅ Make sure logout logic is bound
      break;
    case "signup":
      initSignup();
      break;
    default:
      if (requireAuth()) initDashboard();
  }
}

// React to hash changes like #/dashboard
function handleRouteChange() {
  const hash = window.location.hash.replace("#/", "");
  const page = routes.includes(hash) ? hash : "dashboard";

  showPage(page);
  loadPageLogic(page);

  updateNavbar();
}

// Init SPA routing
export function routerInit() {
  window.addEventListener("hashchange", handleRouteChange);
  handleRouteChange();
}
