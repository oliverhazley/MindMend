/*
  signup.js
  - Loaded by "signup.html", handles creating a new user account.
*/
document.addEventListener("DOMContentLoaded", () => {
  console.log("signup.js loaded: handling signup form events.");

  const signupForm = document.getElementById("signupForm");
  if (signupForm) {
    signupForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      // Extract the user-provided data
      const formData = new FormData(signupForm);
      const email = formData.get("email");
      const password = formData.get("password");

      try {
        // Send these to your backend endpoint for signup
        const response = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
          alert("Sign-up failed. Please check your inputs.");
          return;
        }

        // Parse response; might contain user info or a token
        // const data = await response.json();

        // Possibly store token and redirect to login page or dashboard
        // localStorage.setItem("token", data.token);

        window.location.href = "./login.html";
      } catch (error) {
        console.error("Error during sign-up:", error);
        alert("An error occurred while creating your account.");
      }
    });
  }
});
