// src/scripts/signup.js
// THIS IS THE SIGNUP PAGE.
// IT HANDLES THE SIGNUP FUNCTIONALITY.
// IT ALLOWS USERS TO ENTER THEIR CREDENTIALS AND SIGN UP FOR AN ACCOUNT.
// IT ALSO HANDLES THE UI FOR THE SIGNUP FORM.
// WE CHECK FOR ERRORS AND ALERT THE USER IF SOMETHING GOES WRONG.
// WE CHECK IF EMAIL IS ALREADY REGISTERED.
// -----------------------------------------------------------------------------

import {API_BASE_URL} from './config.js';
import {getText} from './i18n.js';

export function initSignup() {
  console.log('signup.js: initializing signup view');

  const signupForm = document.getElementById('signupForm');
  if (!signupForm) return;

  // Find or create error container
  let errorContainer = document.getElementById('signup-error-container');
  if (!errorContainer) {
    errorContainer = document.createElement('div');
    errorContainer.id = 'signup-error-container';
    errorContainer.className =
      'hidden p-3 mb-4 text-sm rounded border border-red-600 bg-red-100/10 text-red-500';
    signupForm.insertBefore(errorContainer, signupForm.firstChild);
  }

  // Clear errors when user starts typing
  const inputs = [
    document.getElementById('signup-name'),
    document.getElementById('signup-email'),
    document.getElementById('signup-password'),
    document.getElementById('signup-confirm'),
  ];

  inputs.forEach((input) => {
    if (input) {
      input.addEventListener('input', () => {
        hideError();
      });
    }
  });

  signupForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    // Gather fields, including confirm password
    const formData = new FormData(signupForm);
    const name = formData.get('name')?.trim();
    const email = formData.get('email')?.trim();
    const password = formData.get('password');
    const confirmPassword = formData.get('confirm');

    // Simple client-side check
    if (password !== confirmPassword) {
      showError(
        getText(
          'signup.error.passwordsDontMatch',
          "Passwords don't match. Please re-enter them.",
        ),
      );
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/users/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({name, email, password}),
      });

      if (!response.ok) {
        const errorPayload = await response.json();
        console.error('Sign-up error payload:', errorPayload);

        if (errorPayload.errors && errorPayload.errors.length > 0) {
          // Display messages from express-validator
          const messages = errorPayload.errors.map((err) => err.msg).join('. ');
          showError(messages);
        } else {
          // Fallback to existing logic if 'errors' array is not present
          const msg = errorPayload?.message?.toLowerCase() || '';
          if (msg.includes('already exists') || msg.includes('in use')) {
            showError(
              getText(
                'signup.error.emailExists',
                'That email address is already registered. Please log in instead.',
              ),
            );
          } else {
            showError(
              errorPayload?.message || // Keep server message if it exists
                getText(
                  'signup.error.apiDefault',
                  'Sign-up failed. Please check your inputs or try again.',
                ),
            );
          }
        }
        return;
      }

      // On success, grab token & user_id, then navigate
      const data = await response.json();
      if (data.token) {
        localStorage.setItem('token', data.token); // Save token
        localStorage.setItem('user_id', data.user_id); // Save user id
      }
      window.location.hash = '#/dashboard';
    } catch (err) {
      console.error('Error during sign-up:', err);
      showError(
        getText(
          'signup.error.unexpected',
          'Something went wrong while creating your account. Please try again later.',
        ),
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
