// src/scripts/settings.js
import { connectPolarH10 } from "./polarConnect.js";

document.addEventListener("DOMContentLoaded", () => {
  const polarBtn = document.getElementById("polarConnectBtn");
  if (polarBtn) {
    polarBtn.addEventListener("click", () => {
      connectPolarH10();
    });
  }
});
