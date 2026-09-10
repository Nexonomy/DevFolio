'use client';
import { useRef, useSyncExternalStore } from 'react';

const links = [['work', 'Work'], ['experience', 'Experience'], ['about', 'About'], ['contact', 'Say hello']];

function subscribeTheme(notify) {
  const observer = new MutationObserver(notify);
  observer.observe(document.documentElement, { attributes:true, attributeFilter:['data-theme'] });
  return () => observer.disconnect();
}

export default function Navbar() {
  const dark = useSyncExternalStore(subscribeTheme, () => document.documentElement.getAttribute('data-theme') !== 'light', () => true);
  const menu = useRef(null);
  const closeMenu = () => menu.current?.removeAttribute('open');
  const toggleTheme = () => document.documentElement.setAttribute('data-theme', dark ? 'light' : 'dark');

  return <header className="navbar">
    <a className="skip-link" href="#main">Skip to content</a>
    <a href="#hero" className="navbar-logo" aria-label="Ahsan Tariq home"><span className="logo-mark" aria-hidden="true">AT</span><span>Ahsan Tariq<span className="logo-caption">GAMES, WORLDS & ODD IDEAS</span></span></a>
    <div className="navbar-right">
      <nav aria-label="Main navigation" className="desktop-nav"><ul className="navbar-links">{links.map(([id, label]) => <li key={id}><a href={'#' + id}>{label}</a></li>)}</ul></nav>
      <button className="theme-toggle" type="button" onClick={toggleTheme} aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'} aria-pressed={dark}><span aria-hidden="true">{dark ? '☀' : '☾'}</span></button>
      <details ref={menu} className="mobile-menu" onKeyDown={event => { if (event.key === 'Escape') { closeMenu(); menu.current?.querySelector('summary')?.focus(); } }}>
        <summary>Menu <span aria-hidden="true">＋</span></summary>
        <nav aria-label="Mobile navigation">{links.map(([id, label]) => <a key={id} href={'#' + id} onClick={closeMenu}>{label} <span aria-hidden="true">↗</span></a>)}</nav>
      </details>
    </div>
  </header>;
}
