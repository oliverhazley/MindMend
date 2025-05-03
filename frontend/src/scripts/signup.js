// src/scripts/signup.js

import { API_BASE_URL } from "./config.js";

export function initSignup() {
  console.log("signup.js: initializing signup view");

  const signupForm = document.getElementById("signupForm");
  if (!signupForm) return;

  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    // Gather fields, including confirm password
    const formData = new FormData(signupForm);
    const name            = formData.get("name")?.trim();
    const email           = formData.get("email")?.trim();
    const password        = formData.get("password");
    const confirmPassword = formData.get("confirm");

    // Simple client-side check
    if (password !== confirmPassword) {
      alert("Passwords don’t match. Please re-enter them.");
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/users/auth/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        }
      );

      // If server rejects, inspect the JSON error payload
      if (!response.ok) {
        let errorPayload = null;
        try {
          errorPayload = await response.json();
        } catch (e) {
          console.error("Failed to parse error JSON:", e);
        }

        console.error("Sign-up error payload:", errorPayload);

        // Specific check for "email already exists"
        const msg = errorPayload?.message?.toLowerCase() || "";
        if (msg.includes("already exists") || msg.includes("in use")) {
          alert("That email address is already registered. Please log in instead.");
        } else {
          alert(
            errorPayload?.message ||
            "Sign-up failed. Please check your inputs or try again."
          );
        }
        return;
      }

      // On success, grab token & user_id, then navigate
      const data = await response.json();
      if (data.token) {
        localStorage.setItem("token", data.token); // Save token
        localStorage.setItem("user_id", data.user_id); // Save user id
      }
      window.location.hash = "#/dashboard";
    } catch (err) {
      console.error("Error during sign-up:", err);
      alert("Something went wrong while creating your account.");
    }
  });
}
