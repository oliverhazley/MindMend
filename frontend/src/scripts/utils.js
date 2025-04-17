/**
 * Checks for token and redirects to login if not found.
 * Use at the start of every page init function that requires login.
 */
export function requireAuth() {
  const token = localStorage.getItem("token");

  if (!token) {
    window.location.hash = "/login"; // redirect to login page
    return false;
  }

  return true;
}

/**
 * Utility: logout the user and redirect to login
 */
export function logoutUser() {
  localStorage.removeItem("token");
  localStorage.removeItem("user_id");
  window.location.hash = "/login";
}
