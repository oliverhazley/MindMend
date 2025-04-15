// Function to handle user logout
function logout() {
  try {
    // Clear authentication token from local storage
    localStorage.removeItem('token');

    // Clear any user-related session data
    sessionStorage.clear();

    // Redirect to login page
    window.location.href = './login.html';

    console.log('Logout successful');
  } catch (error) {
    console.error('Error during logout:', error);
  }
}

// Add event listener to logout button
document.addEventListener('DOMContentLoaded', function () {
  const logoutButton = document.getElementById('logoutButton');
  if (logoutButton) {
    logoutButton.addEventListener('click', logout);
  }
});
