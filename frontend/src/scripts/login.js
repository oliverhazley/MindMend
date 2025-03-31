/*
  login.js
  - This script is loaded on "login.html" to handle the login form submission.
  - It might send a POST request to /api/auth/login or your actual endpoint.
*/
document.addEventListener("DOMContentLoaded", () => {
  console.log("login.js loaded: handling login form events.");

  // Grab the form element
  const loginForm = document.getElementById("loginForm");

  if (loginForm) {
    // Listen for the form's submit event
    loginForm.addEventListener("submit", async (event) => {
      event.preventDefault(); // Prevent default page reload on submit

      // Extract user input from the form
      const formData = new FormData(loginForm);
      const email = formData.get("email");
      const password = formData.get("password");

      try {
        // Example: send a POST request with user credentials
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        // Check if the request succeeded (e.g., status code 200)
        if (!response.ok) {
          alert("Login failed. Check credentials or try again.");
          return;
        }

        // Parse the response body (assuming JSON)
        const data = await response.json();
        // Possibly store a JWT token or session info
        // localStorage.setItem("token", data.token);

        // Redirect user to the dashboard on success
        window.location.href = "./dashboard.html";
      } catch (error) {
        console.error("Error during login:", error);
        alert("An error occurred while logging in.");
      }
    });
  }
});
