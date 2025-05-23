// src/scripts/i18n.js
// -----------------------------------------------------------------------------
// Handles loading language files, switching between languages, and updating the UI.
// -----------------------------------------------------------------------------

import {updateUIAfterLanguageChange} from './polarConnect.js';

const STORAGE_KEY = 'lang';
let currentLang = localStorage.getItem(STORAGE_KEY) || 'en';
let currentTranslations = {};

// grab our two icon-containers
const desktopLangIcon = document.getElementById('langIconDesktop');
const mobileLangIcon = document.getElementById('langIconMobile');

async function initI18n() {
  // load the proper JSON file
  try {
    const res = await fetch(`./locales/${currentLang}.json`);
    currentTranslations = await res.json();
  } catch (err) {
    console.error('Could not load', currentLang, 'bundle:', err);
    currentTranslations = {};
    return;
  }

  // translate every element with data-i18n-key
  document.querySelectorAll('[data-i18n-key]').forEach((el) => {
    const key = el.dataset.i18nKey;
    const txt = currentTranslations[key];
    if (!txt) return;

    switch (el.tagName) {
      case 'INPUT':
      case 'TEXTAREA':
        el.placeholder = txt;
        break;
      case 'OPTION':
        el.textContent = txt;
        break;
      case 'SELECT':
        // skip—otherwise you wipe out all your <option>s
        break;
      default:
        el.textContent = txt;
    }
  });

  // update the little label in the toggle buttons
  const nextLang = currentLang === 'fi' ? 'EN' : 'FI';
  if (desktopLangIcon) desktopLangIcon.textContent = nextLang;
  if (mobileLangIcon) mobileLangIcon.textContent = nextLang;

  // Call this function to update the dynamic UI elements that need translation
  // This ensures connection button and message states are correctly translated
  updateUIAfterLanguageChange();
}

function getText(key, fallbackText = '') {
  const translated = currentTranslations[key];
  if (translated) {
    return translated;
  }
  if (fallbackText) {
    console.warn(`Translation missing for key: "${key}". Using fallback text.`);
    return fallbackText;
  }
  console.warn(`Translation missing for key: "${key}". Returning key.`);
  return key;
}

// Get the current language code
function getCurrentLanguage() {
  return currentLang;
}

// switch between 'fi' and 'en'
function toggleLanguage() {
  currentLang = currentLang === 'fi' ? 'en' : 'fi';
  localStorage.setItem(STORAGE_KEY, currentLang);
  initI18n();

  // Update charts after language change
  try {
    // Try to import and call onLanguageChanged from dashboard.js
    // Using dynamic import to avoid circular dependency issues
    import('./dashboard.js')
      .then((module) => {
        if (typeof module.onLanguageChanged === 'function') {
          module.onLanguageChanged();
        }
      })
      .catch((err) => {
        console.warn('Could not update charts after language change:', err);
      });
  } catch (err) {
    console.warn('Error updating charts after language change:', err);
  }
}

// wire up our toggle buttons
document
  .querySelectorAll('#langToggleDesktop, #langToggleMobile')
  .forEach((btn) => btn.addEventListener('click', toggleLanguage));

// run on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initI18n);
} else {
  initI18n();
}

// EXPORT SO OTHER MODULES CAN RE-TRIGGER TRANSLATION
export {initI18n, getText, getCurrentLanguage};
