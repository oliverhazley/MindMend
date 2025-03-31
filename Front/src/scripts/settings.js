/*
  settings.js
  - Loaded by "settings.html".
  - Handles user preferences, such as username or notification settings.
*/
document.addEventListener("DOMContentLoaded", () => {
  console.log("settings.js loaded: managing user settings form.");

  const settingsForm = document.getElementById("settingsForm");
  if (settingsForm) {
    settingsForm.addEventListener("submit", (event) => {
      event.preventDefault();

      // Extract form data
      const formData = new FormData(settingsForm);
      const username = formData.get("username");
      const notifications = formData.get("notifications");

      // Example: Save to localStorage or send to an API
      // localStorage.setItem("username", username);
      // localStorage.setItem("notifications", notifications);
      // Or a fetch to /api/settings

      console.log("Settings saved:", { username, notifications });
      alert("Settings saved!");
    });
  }
});
