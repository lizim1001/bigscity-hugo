/* Run before CSS so a saved light theme is applied before the first paint. */
(() => {
  'use strict';
  const key = 'mairl.apple.theme.v1', root = document.documentElement;
  const valid = value => value === 'light' || value === 'dark';
  let theme = 'light';
  try { const saved = localStorage.getItem(key); if (valid(saved)) theme = saved; } catch {}
  function apply(value, persist = false) {
    theme = valid(value) ? value : 'light'; root.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", theme === "light" ? "#F2F2F7" : "#000000");
    if (persist) { try { localStorage.setItem(key, theme); } catch {} }
    document.querySelectorAll('[data-theme-toggle]').forEach(button => {
      button.setAttribute('aria-pressed', String(theme === 'light'));
      const label = theme === 'light' ? '切换为深色模式' : '切换为浅色模式';
      button.setAttribute('aria-label', label); button.title = label;
      button.querySelector('[data-theme-label]').textContent = theme === 'light' ? '夜间' : '日间';
    });
    window.dispatchEvent(new CustomEvent('mairl-theme-change', {detail: {theme}}));
  }
  apply(theme);
  const bind = () => {
    apply(theme);
    document.querySelectorAll('[data-theme-toggle]').forEach(button => {
      button.hidden = false;
      button.addEventListener('click', () => apply(theme === 'light' ? 'dark' : 'light', true));
    });
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bind, {once:true}); else bind();
  window.addEventListener('storage', event => { if (event.key === key || event.key === null) apply(event.newValue); });
})();
