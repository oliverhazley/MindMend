// src/scripts/profile.js
import {connectPolarH10} from './polarConnect.js';
import {API_BASE_URL} from './config.js';

// This function gets called when the profile page is loaded
export async function initProfile() {
  console.log('profile.js: Initializing profile view');
  await loadUserInfo();
  profileHandlers();
}

async function loadUserInfo() {
  const token = localStorage.getItem('token');
  if (!token) return;
  try {
    // Assumes backend has an endpoint like `/users/profile` or `/users/profile/me`
    // that retrieves the profile of the user authenticated by the token.
    // This endpoint would not require a userId in the path.
    const res = await fetch(
      `${API_BASE_URL}/users/me/profile`, // Or your specific "me" endpoint, e.g., /users/profile/me
      {headers: {Authorization: `Bearer ${token}`}},
    );
    if (!res.ok) throw await res.json();
    const user = await res.json();
    document.getElementById('profileName').textContent = user.name;
    document.getElementById('profileEmail').textContent = user.email;
  } catch (err) {
    console.error('Failed to load profile:', err);
  }
}

function profileHandlers() {
  const changePassword = document.getElementById('changePasswordBtn');
  const deleteAccount = document.getElementById('deleteAccountBtn');
  if (changePassword)
    changePassword.addEventListener('click', handleChangePassword);
  if (deleteAccount)
    deleteAccount.addEventListener('click', handleDeleteAccount);
}

async function handleChangePassword() {
  const current = document.getElementById('currentPassword').value;
  const next = document.getElementById('newPassword').value;
  const confirm = document.getElementById('confirmNewPassword').value;
  if (next !== confirm) {
    return alert('New passwords do not match');
  }

  const userId = localStorage.getItem('user_id');
  try {
    const res = await fetch(`${API_BASE_URL}/users/auth/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({
        userId,
        currentPassword: current,
        newPassword: next,
      }),
    });
    if (!res.ok) throw await res.json();
    alert('Password updated');
    document.getElementById('currentPassword').value = '';
    document.getElementById('newPassword').value = '';
    document.getElementById('confirmNewPassword').value = '';
  } catch (err) {
    alert(err.message || 'Failed to change password');
  }
}

async function handleDeleteAccount() {
  if (
    !confirm(
      'Are you sure you want to delete your account? This cannot be undone.',
    )
  )
    return;
  const userId = localStorage.getItem('user_id');
  try {
    const res = await fetch(`${API_BASE_URL}/users/auth/delete/${userId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    if (!res.ok) throw await res.json();
    // clean up & redirect
    localStorage.clear();
    window.location.hash = '#/';
    window.location.reload();
  } catch (err) {
    alert(err.message || 'Failed to delete account');
  }
}

// Handle connection button (main dashboard page)
const polarBtn = document.getElementById('polarConnectBtn');
if (polarBtn) {
  polarBtn.addEventListener('click', () => {
    console.log('Connect button clicked (polarConnectBtn)');
    connectPolarH10();
  });
}

// Handle alternate button (e.g. mobile or secondary position)
const polarBtnAlt = document.getElementById('polarConnectBtn1');
if (polarBtnAlt) {
  polarBtnAlt.addEventListener('click', () => {
    console.log('Connect button clicked (polarConnectBtn1)');
    connectPolarH10();
  });
}
