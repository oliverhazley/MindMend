// src/scripts/login.js
// Import base API URL for consistency across environments
import { API_BASE_URL } from "./config.js";

// Run this when the DOM has fully loaded
document.addEventListener("DOMContentLoaded", () => {
  console.log("login.js loaded: handling login form events.");

  // Grab the login form
  const loginForm = document.getElementById("loginForm");

  // Only proceed if the form exists
  if (loginForm) {
    // Listen for the submit event
    loginForm.addEventListener("submit", async (event) => {
      event.preventDefault(); // Prevent page refresh on form submit

      // Get user input from the form
      const formData = new FormData(loginForm);
      const email = formData.get("email");
      const password = formData.get("password");

      try {
        // Send login request to backend
        const response = await fetch(`${API_BASE_URL}/users/auth/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        });

        // If credentials are invalid or user not found
        if (!response.ok) {
          alert("Login failed. Check your email or password.");
          return;
        }

        // Parse the returned JSON response
        const data = await response.json();

        // ✅ Store the JWT in localStorage for future API requests
        if (data.token) {
          localStorage.setItem("token", data.token);
          console.log("JWT token stored in localStorage.");
        } else {
          console.warn("No token received from backend.");
        }

        // Redirect to the dashboard after login
        window.location.href = "./dashboard.html";
      } catch (error) {
        console.error("Error during login:", error);
        alert("Something went wrong during login.");
      }
    });
  }
});
