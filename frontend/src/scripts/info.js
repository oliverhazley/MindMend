// src/scripts/info.js

import { requireAuth } from "./utils.js";

export function initInfo() {
  if (!requireAuth()) return;

  console.log("📘 Loading info page");

  // Initialize Lucide icons
  if (window.lucide) {
    lucide.createIcons();
  }

  // Accordion toggle logic
  document.querySelectorAll('.accordion-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const panelId = btn.getAttribute('data-target');
      const panel = document.getElementById(panelId);
      if (!panel) return;

      panel.classList.toggle('hidden');

      // Toggle arrow icon
      const icon = btn.querySelector('.accordion-icon');
      if (icon) {
        icon.textContent = panel.classList.contains('hidden') ? '▼' : '▲';
      }
    });
  });
}
