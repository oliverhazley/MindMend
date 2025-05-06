// src/scripts/login.js

// THIS IS THE LOGIN PAGE. IT HANDLES THE LOGIN FUNCTIONALITY.
// IT ALLOWS USERS TO ENTER THEIR CREDENTIALS AND LOG IN TO THE APP.
// IT ALSO HANDLES THE UI FOR THE LOGIN FORM.
// -----------------------------------------------------------------------------

import {API_BASE_URL} from './config.js';

let isLoginInitialized = false; // Guard to prevent multiple initializations

export function initLogin() {
  if (isLoginInitialized) {
    console.log('login.js: Login form already initialized.');
    return;
  }

  console.log('login.js loaded: initializing login form');
  isLoginInitialized = true;

  const loginForm = document.getElementById('loginForm');

  if (loginForm) {
    // Find or create error container
    let errorContainer = document.getElementById('login-error-container');
    if (!errorContainer) {
      errorContainer = document.createElement('div');
      errorContainer.id = 'login-error-container';
      errorContainer.className =
        'hidden p-3 mb-4 text-sm rounded border border-red-600 bg-red-100/10 text-red-500';
      loginForm.insertBefore(errorContainer, loginForm.firstChild);
    }

    // Clear errors when user starts typing
    const emailInput = document.getElementById('login-email');
    const passwordInput = document.getElementById('login-password');
    [emailInput, passwordInput].forEach((input) => {
      if (input) {
        input.addEventListener('input', () => {
          hideError();
        });
      }
    });

    loginForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      const formData = new FormData(loginForm);
      const email = formData.get('email');
      const password = formData.get('password');

      try {
        const response = await fetch(`${API_BASE_URL}/users/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({email, password}),
        });

        if (!response.ok) {
          showError('Login failed. Please check your credentials.');
          return;
        }

        const data = await response.json();

        if (data.token) {
          localStorage.setItem('token', data.token);

          //  Safely extract user ID from nested response
          const userId = data.user?.userId;
          if (userId !== undefined && userId !== null) {
            localStorage.setItem('user_id', userId);
            console.log(`user_id stored: ${userId}`);
          } else {
            console.warn(
              'Login response missing user_id. Cleaning up localStorage.',
            );
            localStorage.removeItem('user_id');
          }

          //  Navigate to dashboard
          window.location.hash = '#/dashboard';
        } else {
          showError('Login failed. Missing authentication token.');
        }
      } catch (error) {
        console.error('Error during login:', error);
        showError(
          'Something went wrong while logging in. Please try again later.',
        );
      }
    });

    // Helper functions for showing/hiding errors
    function showError(message) {
      errorContainer.textContent = message;
      errorContainer.classList.remove('hidden');
    }

    function hideError() {
      errorContainer.classList.add('hidden');
    }
  }
}
