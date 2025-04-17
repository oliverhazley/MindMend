// src/scripts/main.js

import "../styles/tailwind.css";
import { routerInit } from "./router.js";
import { updateNavbar } from "./navbar.js";
import { stopAutoRMSSDSave } from "./polarConnect.js"; // ✅ cleanup on tab close

// ✅ Initial logic once when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  console.log("main.js loaded ✅");

  // Init SPA routing logic
  routerInit();

  // Show correct nav based on login status
  updateNavbar();

  // Handle default route based on login status
  const token = localStorage.getItem("token");
  if (!window.location.hash || window.location.hash === "#/") {
    if (token) {
      window.location.hash = "#/dashboard";
    } else {
      window.location.hash = "#/login";
    }
  }
});

// ✅ Stop RMSSD autosave on tab close or refresh
window.addEventListener("beforeunload", () => {
  stopAutoRMSSDSave();
});
