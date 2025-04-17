// src/scripts/logout.js
import { showPage } from "./router.js";
import { stopAutoRMSSDSave } from "./polarConnect.js"; // ✅ Stop RMSSD saving

export function initLogout() {
  const logoutBtn = document.getElementById("logoutButton");

  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      try {
        // ✅ Stop saving before wiping session
        stopAutoRMSSDSave();

        localStorage.removeItem("token");
        localStorage.removeItem("user_id");
        sessionStorage.clear();

        console.log("✅ Logout successful");

        window.location.hash = "#/login";
        showPage("login");
      } catch (error) {
        console.error("❌ Error during logout:", error);
      }
    });
  }
}
