'use client';

import { useSyncExternalStore } from 'react';

type Theme = 'light' | 'dark';

function getInitialTheme(): Theme {
  if (typeof document === 'undefined') return 'light';
  const attr = document.documentElement.getAttribute('data-rs-theme');
  return attr === 'dark' ? 'dark' : 'light';
}

function subscribeToTheme(callback: () => void) {
  window.addEventListener('rs-theme-change', callback);
  window.addEventListener('storage', callback);

  return () => {
    window.removeEventListener('rs-theme-change', callback);
    window.removeEventListener('storage', callback);
  };
}

const styles = `
  .rs-theme-toggle {
    position: fixed;
    top: 18px;
    right: 18px;
    z-index: 50;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 12px;
    border: 1px solid var(--rule);
    background: var(--paper);
    color: var(--ink);
    font-family: var(--font-sans);
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    cursor: pointer;
    transition: background 120ms, color 120ms, border-color 120ms;
    line-height: 1;
  }
  .rs-theme-toggle:hover { border-color: var(--ink); }
  .rs-theme-toggle .glyph {
    font-size: 13px;
    line-height: 1;
    color: var(--accent);
  }
  @media (max-width: 480px) {
    .rs-theme-toggle { top: 12px; right: 12px; padding: 7px 10px; font-size: 10px; letter-spacing: 0.14em; }
  }
`;

export default function ThemeToggle() {
  const theme = useSyncExternalStore(subscribeToTheme, getInitialTheme, () => 'light' as Theme);

  function toggle() {
    const next: Theme = theme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-rs-theme', next);
    try {
      window.localStorage.setItem('rs-theme', next);
    } catch {
      // localStorage may be blocked (private mode, restricted iframe). Fail silently.
    }
    window.dispatchEvent(new Event('rs-theme-change'));
  }

  const label = theme === 'dark' ? 'Light' : 'Dark';
  const glyph = theme === 'dark' ? '☀' : '☾';

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <button
        type="button"
        className="rs-theme-toggle"
        onClick={toggle}
        aria-label={`Switch to ${label.toLowerCase()} mode`}
      >
        <span className="glyph" aria-hidden="true">{glyph}</span>
        <span>{label}</span>
      </button>
    </>
  );
}
