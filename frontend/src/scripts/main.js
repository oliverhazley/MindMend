// src/scripts/main.js

import "../styles/tailwind.css";
import { routerInit } from "./router.js";
import { updateNavbar } from "./navbar.js";
import { stopAutoRMSSDSave } from "./polarConnect.js"; //  cleanup on tab close
import { exportHRVPDF } from "./ExportData.js";

//  Initial logic once when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  console.log("main.js loaded ✅");

  // PDF export from either location
  document.getElementById("exportPDFBtnDashboard")?.addEventListener("click", exportHRVPDF);
  document.getElementById("exportPDFBtnSettings")?.addEventListener("click", exportHRVPDF);


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
      window.location.hash = "#/"; // landing page
    }
  }
});

// Stop RMSSD autosave on tab close or refresh
window.addEventListener("beforeunload", () => {
  stopAutoRMSSDSave();
});


// Theme toggle logic (once DOM is ready)
document.addEventListener("DOMContentLoaded", () => {
  const toggles = Array.from(document.querySelectorAll(".theme-toggle-btn"));

  // helper: re-render all toggle buttons
  function setThemeIcon(name) {
    toggles.forEach(btn => {
      btn.innerHTML = `<i data-lucide="${name}" class="theme-icon w-6 h-6"></i>`;
    });
    if (window.lucide) lucide.createIcons();
  }

  // read saved theme (default = dark)
  const saved = localStorage.getItem("theme") || "dark";
  const lightMode = saved === "light";

  // apply class + initial icon
  document.body.classList.toggle("light-mode", lightMode);
  setThemeIcon(lightMode ? "moon" : "sun");

  // on click: flip class, save, swap icon
  toggles.forEach(btn =>
    btn.addEventListener("click", () => {
      const nowLight = document.body.classList.toggle("light-mode");
      localStorage.setItem("theme", nowLight ? "light" : "dark");
      setThemeIcon(nowLight ? "moon" : "sun");
    })
  );
});



