// Load this in <head> (no defer) so the theme is applied before the page paints.
(function () {
  const root = document.documentElement;
  const mq = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
 
  function saved() {
    try {
      const v = localStorage.getItem('theme');
      return v === 'dark' || v === 'light' ? v : null;
    } catch (e) { return null; } // storage blocked: fall back to the OS setting
  }
 
  function apply(theme) {
    root.classList.toggle('dark', theme === 'dark');
    const btn = document.getElementById('themeToggle');
    if (btn) btn.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
  }
 
  const initial = saved() || (mq && mq.matches ? 'dark' : 'light');
  apply(initial);
 
  document.addEventListener('DOMContentLoaded', function () {
    apply(root.classList.contains('dark') ? 'dark' : 'light'); // sync button state
    const btn = document.getElementById('themeToggle');
    if (!btn) return;
    btn.addEventListener('click', function () {
      const next = root.classList.contains('dark') ? 'light' : 'dark';
      apply(next);
      try { localStorage.setItem('theme', next); } catch (e) { /* ignore */ }
    });
  });
 
  // Follow the OS setting live, until the user picks a theme themselves
  if (mq && mq.addEventListener) {
    mq.addEventListener('change', function (e) {
      if (!saved()) apply(e.matches ? 'dark' : 'light');
    });
  }
})();
