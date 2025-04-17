// src/scripts/signup.js
// Import the base API URL depending on environment (dev vs production)
import { API_BASE_URL } from "./config.js";

// Run this once the page has fully loaded
document.addEventListener("DOMContentLoaded", () => {
  console.log("signup.js loaded: handling signup form events.");

  // Grab the form element by its ID
  const signupForm = document.getElementById("signupForm");

  // Only run if the form is present on the page
  if (signupForm) {
    // Listen for form submission
    signupForm.addEventListener("submit", async (event) => {
      event.preventDefault(); // Prevent form from reloading the page

      // Collect form input values
      const formData = new FormData(signupForm);
      const name = formData.get("name");
      const email = formData.get("email");
      const password = formData.get("password");

      try {
        // Send the user's details to the backend API
        const response = await fetch(`${API_BASE_URL}/users/auth/register`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json", // Tell backend we're sending JSON
          },
          body: JSON.stringify({ name, email, password }), // Convert JS object to JSON string
        });

        // If registration failed (e.g. email taken, missing fields), alert the user
        if (!response.ok) {
          alert("Sign-up failed. Please check your inputs.");
          return;
        }

        //handle token or user data if returned by backend
        const data = await response.json();
        localStorage.setItem("token", data.token);

        // Redirect to login page after successful sign-up
        window.location.href = "./login.html";
      } catch (error) {
        console.error("Error during sign-up:", error);
        alert("Something went wrong while creating your account.");
      }
    });
  }
});
