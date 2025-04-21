// src/scripts/settings.js
import { connectPolarH10 } from "./polarConnect.js";

// This function gets called when the settings page is loaded
export function initSettings() {
  console.log("settings.js: Initializing settings view");

  // Handle connection button (main dashboard page)
  const polarBtn = document.getElementById("polarConnectBtn");
  if (polarBtn) {
    polarBtn.addEventListener("click", () => {
      console.log("Connect button clicked (polarConnectBtn)");
      connectPolarH10();
    });
  }

  // Handle alternate button (e.g. mobile or secondary position)
  const polarBtnAlt = document.getElementById("polarConnectBtn1");
  if (polarBtnAlt) {
    polarBtnAlt.addEventListener("click", () => {
      console.log("Connect button clicked (polarConnectBtn1)");
      connectPolarH10();
    });
  }
}
