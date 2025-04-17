// src/scripts/signup.js
import { API_BASE_URL } from "./config.js";

// Exported initializer for the SPA router
export function initSignup() {
  console.log("signup.js: initializing signup view");

  const signupForm = document.getElementById("signupForm");

  if (signupForm) {
    signupForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      const formData = new FormData(signupForm);
      const name = formData.get("name");
      const email = formData.get("email");
      const password = formData.get("password");

      try {
        const response = await fetch(`${API_BASE_URL}/users/auth/register`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name, email, password }),
        });

        if (!response.ok) {
          alert("Sign-up failed. Please check your inputs or try a different email.");
          return;
        }

        const data = await response.json();

        if (data.token) {
          localStorage.setItem("token", data.token);
          localStorage.setItem("user_id", data.user_id); // Optional: store user ID if returned
        }

        // Navigate to dashboard (SPA-style)
        window.location.hash = "#/dashboard";
      } catch (error) {
        console.error("Error during sign-up:", error);
        alert("Something went wrong while creating your account.");
      }
    });
  }
}
