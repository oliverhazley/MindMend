// info.js
// this file handles the info page, including the accordion functionality.
// it is responsible for displaying information about the app, including the privacy policy and terms of service.
// it uses the lucide library for icons and requires authentication to access.
// it also includes functions to initialize the page and handle the accordion toggle logic.
// ----------------------------------------------------------------------

import {requireAuth} from './router.js';

export function initInfo() {
  if (!requireAuth()) return;

  console.log('Loading info page');

  // Initialize Lucide icons
  if (window.lucide) {
    lucide.createIcons();
  }

  // Accordion toggle logic (safe binding + sync initial icon)
  document.querySelectorAll('.accordion-btn').forEach((btn) => {
    if (btn.dataset.bound === 'true') return;
    btn.dataset.bound = 'true';

    const panelId = btn.getAttribute('data-target');
    const panel = document.getElementById(panelId);
    const icon = btn.querySelector('.accordion-icon');

    // Sync icon with initial state
    if (panel && icon) {
      const isClosed = panel.classList.contains('closed');
      icon.textContent = isClosed ? '▼' : '▲';
    }

    btn.addEventListener('click', () => {
      if (!panel || !icon) return;

      const isOpen = !panel.classList.contains('closed');
      if (isOpen) {
        panel.classList.add('closed');
        icon.textContent = '▼';
      } else {
        panel.classList.remove('closed');
        icon.textContent = '▲';
      }
    });
  });
}
