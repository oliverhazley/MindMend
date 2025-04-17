/*
  info.js
  - Loaded by "info.html".
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide icons
  if (window.lucide) {
    lucide.createIcons();
  }

  // Accordion toggles
  document.querySelectorAll('.accordion-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const panelId = btn.getAttribute('data-target');
      const panel = document.getElementById(panelId);
      panel.classList.toggle('hidden');
      // Toggle arrow
      const icon = btn.querySelector('.accordion-icon');
      icon.textContent = panel.classList.contains('hidden') ? '▼' : '▲';
    });
  });
});