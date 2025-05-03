// src/scripts/logout.js
// THIS IS THE LOGOUT FUNCTIONALITY.
// IT HANDLES THE LOGOUT PROCESS, INCLUDING CLEARING LOCAL STORAGE AND REDIRECTING TO THE LANDING PAGE.
// IT ALSO HANDLES THE NAVIGATION BAR UPDATES.
// -----------------------------------------------------------------------------

import { showPage } from "./router.js";
import { stopAutoRMSSDSave } from "./polarConnect.js"; //  Stop RMSSD saving
import { updateNavbar } from "./navbar.js";           // Refresh nav links

/**
 * Attach logout behavior to both desktop & mobile buttons.
 */
export function initLogout() {
  const logoutBtn       = document.getElementById("logoutButton");
  const logoutBtnMobile = document.getElementById("logoutButtonMobile");

  // Unified logout handler
  const handleLogout = (event) => {
    // ───────────────────────────────────────────────────────────────
    // PREVENT the default <a href> navigation (which was "#/login")
    // so we can control exactly where it goes: our landing page.
    // ───────────────────────────────────────────────────────────────
    event.preventDefault();

    try {
      //  Stop any ongoing RMSSD saves before wiping session
      stopAutoRMSSDSave();

      //  Clear stored credentials
      localStorage.removeItem("token");
      localStorage.removeItem("user_id");

      //  Clear out any fetched HRV data so next user starts fresh
      localStorage.removeItem("cachedHRVData");

      //  In case we ever use sessionStorage for UI state
      sessionStorage.clear();

      console.log("✅ Logout successful");

      //  Immediately update navbar to hide protected links
      updateNavbar();

      //  Redirect to landing page (home)
      //  We use '#/' (empty hash) so router maps to 'home'
      window.location.hash = "#/";
      showPage("home");             // immediately show home section
    } catch (error) {
      console.error("❌ Error during logout:", error);
    }
  };

  // Bind both desktop & mobile logout buttons (if present)
  [logoutBtn, logoutBtnMobile].forEach(btn => {
    if (btn) btn.addEventListener("click", handleLogout);
  });
}
