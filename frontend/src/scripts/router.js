// src/scripts/router.js
// THIS IS THE ROUTER FOR OUR SINGLE PAGE APPLICATION (SPA).
// IT HANDLES THE NAVIGATION BETWEEN DIFFERENT PAGES OF THE APP.
// IT ALSO HANDLES THE INITIALIZATION OF DIFFERENT SECTIONS OF THE APP.
// WITHOUT THIS, WE WOULD HAVE TO RELOAD THE PAGE EVERY TIME WE NAVIGATE.
// AND WE WOULD LOSE OUR BLUETOOTH CONNECTION.
// RENDERING OUR APP USELESS FOR ITS INTEDED USE.
// THIS IS THE HEART AND SOUL OF OUR SPA.
// -----------------------------------------------------------------------------

//  Section initializers
import {initDashboard} from './dashboard.js';
import {initChat} from './chat.js';
import {initExercises, stopAllExerciseAudio} from './exercises.js';
import {initTetris} from './tetris.js';
import {initInfo} from './info.js';
import {initProfile} from './profile.js';
import {initLogin} from './login.js';
import {initSignup} from './signup.js';
import {initLogout} from './logout.js';

//  Global utilities
import {updateNavbar} from './navbar.js';

//  List of valid route names
const routes = [
  'home',
  'dashboard',
  'chat',
  'exercises',
  'tetris',
  'info',
  'profile',
  'login',
  'signup',
];

initLogout(); //  Attach logout behavior to both desktop & mobile buttons

// If no JWT is present, redirect to #/login and return false.
export function requireAuth() {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.hash = '#/home';
    return false;
  }
  return true;
}

//  Stop all audio playback when navigating
function stopAllAudio() {
  document.querySelectorAll('audio').forEach((audio) => {
    audio.pause();
    audio.currentTime = 0;
  });
  stopAllExerciseAudio();
}

// Show one page on our SPA and hide the rest
export function showPage(page) {
  stopAllAudio();

  document.querySelectorAll('.spa-page').forEach((section) => {
    section.classList.add('hidden');
  });

  const target = document.getElementById(`page-${page}`);
  if (target) {
    target.classList.remove('hidden');
    window.scrollTo({top: 0});
  }

  // Toggle nav visibility
  const token = localStorage.getItem('token');
  const fullNav = document.querySelectorAll('.spa-protected-nav');
  const publicNav = document.querySelectorAll('.spa-public-nav');

  if (token) {
    fullNav.forEach((el) => el.classList.remove('hidden'));
    publicNav.forEach((el) => el.classList.add('hidden'));
  } else {
    fullNav.forEach((el) => el.classList.add('hidden'));
    publicNav.forEach((el) => el.classList.remove('hidden'));
  }
}

//  Load JS logic for the routes
function loadPageLogic(page) {
  switch (page) {
    case 'home':
      // nothing special to initialize
      break;
    case 'dashboard':
      if (requireAuth()) initDashboard();
      break;
    case 'chat':
      if (requireAuth()) initChat();
      break;
    case 'exercises':
      if (requireAuth()) initExercises();
      break;
    case 'tetris':
      if (requireAuth()) initTetris();
      break;
    case 'info':
      if (requireAuth()) initInfo();
      break;
    case 'profile':
      if (requireAuth()) initProfile();
      break;
    case 'login':
      initLogin();
      break;
    case 'signup':
      initSignup();
      break;
    default:
      // fallback to dashboard if authenticated, else home
      if (requireAuth()) {
        initDashboard();
        initLogout();
      }
  }
}

// React to hash changes like #/dashboard or #/exercises
function handleRouteChange() {
  const hash = window.location.hash.replace('#/', '');
  let page;

  if (hash === '' || hash === 'home') {
    page = 'home';
  } else if (routes.includes(hash)) {
    page = hash;
  } else {
    // unknown route: go to dashboard if logged in, else home
    page = localStorage.getItem('token') ? 'dashboard' : 'home';
  }

  showPage(page);
  loadPageLogic(page);
  updateNavbar();
}

// Init SPA routing
// Init SPA routing
export function routerInit() {
  window.addEventListener('hashchange', handleRouteChange);
  handleRouteChange();
}
