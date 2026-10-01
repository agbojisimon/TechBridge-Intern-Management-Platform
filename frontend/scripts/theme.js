// Theme toggle — switches between light and dark mode and remembers the choice.

const STORAGE_KEY = 'techbridge-theme';

// Apply a theme to the page.
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
}

// Read the saved theme, or fall back to the system setting.
function savedTheme() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'light' || stored === 'dark') { return stored; }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

// Toggle the theme and save the new choice.
function toggleTheme() {
  const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  applyTheme(next);
  localStorage.setItem(STORAGE_KEY, next);
  updateButtons(next);
}

// Keep the accessible label in sync. The sun/moon icons swap via CSS.
function updateButtons(theme) {
  const isDark = theme === 'dark';
  const label = isDark ? 'Switch to light mode' : 'Switch to dark mode';
  document.querySelectorAll('.theme-toggle').forEach(function (btn) {
    btn.setAttribute('aria-label', label);
    btn.setAttribute('title', label);
  });
}

// Set the theme before the page paints to avoid a flash of the wrong colours.
applyTheme(savedTheme());

document.addEventListener('DOMContentLoaded', function () {
  updateButtons(document.documentElement.getAttribute('data-theme'));

  document.querySelectorAll('.theme-toggle').forEach(function (btn) {
    btn.addEventListener('click', toggleTheme);
  });
});
