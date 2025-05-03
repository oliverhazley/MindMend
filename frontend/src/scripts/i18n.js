// src/scripts/i18n.js
// i18n stands for internationalization, which is the process of designing a software application
// so that it can be adapted to various languages and regions without requiring engineering changes.
// this file handles the loading of language files, switching between languages, and updating the UI accordingly.
// -----------------------------------------------------------------------------

const STORAGE_KEY = 'lang';
let currentLang = localStorage.getItem(STORAGE_KEY) || 'en';

// grab our two icon‐containers
const desktopLangIcon = document.getElementById('langIconDesktop');
const mobileLangIcon  = document.getElementById('langIconMobile');

async function initI18n() {
  // load the proper JSON file
  let bundle;
  try {
    const res = await fetch(`./locales/${currentLang}.json`);
    bundle = await res.json();
  } catch (err) {
    console.error('Could not load', currentLang, 'bundle:', err);
    return;
  }

  // translate every element with data-i18n-key
  document.querySelectorAll('[data-i18n-key]').forEach(el => {
    const key = el.dataset.i18nKey;
    const txt = bundle[key];
    if (!txt) return;

    switch (el.tagName) {
      case 'INPUT':
      case 'TEXTAREA':
        el.placeholder = txt;
        break;
      case 'OPTION':
        // translate just the option text
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
  desktopLangIcon.textContent = nextLang;
  mobileLangIcon.textContent  = nextLang;
}

// switch between 'fi' and 'en'
function toggleLanguage() {
  currentLang = currentLang === 'fi' ? 'en' : 'fi';
  localStorage.setItem(STORAGE_KEY, currentLang);
  initI18n();
}

// wire up our new buttons
document
  .querySelectorAll('#langToggleDesktop, #langToggleMobile')
  .forEach(btn => btn.addEventListener('click', toggleLanguage));

// run on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initI18n);
} else {
  initI18n();
}
