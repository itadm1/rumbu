'use client';

import { useEffect, useState } from 'react';
import Icon from './Icon';

// The admin theme is scoped to the `.admin-root` element and stored under its
// own key, so it never changes the public website.
export const THEME_KEY = 'rumbu-admin-theme';

// Runs before first paint (inlined by app/admin/layout.js) to avoid a flash.
export const themeInitScript = `(function(){try{var t=localStorage.getItem('${THEME_KEY}');if(t==='dark'||t==='light'){document.currentScript.parentElement.setAttribute('data-theme',t)}}catch(e){}})()`;

function readTheme() {
  try {
    const t = localStorage.getItem(THEME_KEY);
    return t === 'dark' ? 'dark' : 'light'; // light is the default
  } catch {
    return 'light';
  }
}

function applyTheme(theme) {
  document.querySelectorAll('.admin-root').forEach((el) => el.setAttribute('data-theme', theme));
}

// Keeps the attribute correct after client-side navigation into /admin,
// where the inline script does not run.
export function AdminThemeSync() {
  useEffect(() => { applyTheme(readTheme()); }, []);
  return null;
}

export function ThemeToggle() {
  const [theme, setTheme] = useState('light');
  useEffect(() => { setTheme(readTheme()); }, []);

  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    applyTheme(next);
    try { localStorage.setItem(THEME_KEY, next); } catch { /* preference simply is not persisted */ }
  };

  return (
    <button
      type="button"
      className="a-icon-btn"
      onClick={toggle}
      aria-pressed={theme === 'dark'}
      aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
      title={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
    >
      <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={19} />
    </button>
  );
}
