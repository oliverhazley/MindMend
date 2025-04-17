// src/scripts/login.js

import { API_BASE_URL } from "./config.js";

let isLoginInitialized = false; // Guard to prevent multiple initializations

export function initLogin() {
  if (isLoginInitialized) {
    console.log("login.js: Login form already initialized.");
    return;
  }

  console.log("login.js loaded: initializing login form");
  isLoginInitialized = true;

  const loginForm = document.getElementById("loginForm");

  if (loginForm) {
    loginForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      const formData = new FormData(loginForm);
      const email = formData.get("email");
      const password = formData.get("password");

      try {
        const response = await fetch(`${API_BASE_URL}/users/auth/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
          alert("Login failed. Please check your credentials.");
          return;
        }

        const data = await response.json();

        if (data.token) {
          localStorage.setItem("token", data.token);

          // ✅ Safely extract user ID from nested response
          const userId = data.user?.userId;
          if (userId !== undefined && userId !== null) {
            localStorage.setItem("user_id", userId);
            console.log(`✅ user_id stored: ${userId}`);
          } else {
            console.warn("⚠️ Login response missing user_id. Cleaning up localStorage.");
            localStorage.removeItem("user_id");
          }

          // ✅ Navigate to dashboard
          window.location.hash = "#/dashboard";
        } else {
          alert("Login failed. Missing token.");
        }
      } catch (error) {
        console.error("Error during login:", error);
        alert("Something went wrong while logging in.");
      }
    });
  }
}
