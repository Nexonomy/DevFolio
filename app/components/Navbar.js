'use client';

import { useEffect, useState } from 'react';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
  }, [dark]);

  return (
    <nav className="navbar" style={{ opacity: scrolled ? 0.97 : 1 }}>
      <a href="#hero" className="navbar-logo">
        DEVFOLIO
      </a>
      <div className="navbar-right">
        <ul className="navbar-links">
          <li><a href="#hero">HOME</a></li>
          <li><a href="#work">WORK</a></li>
          <li><a href="#about">ABOUT</a></li>
          <li><a href="#contact">CONTACT</a></li>
        </ul>
        <button
          className="theme-toggle"
          onClick={() => setDark(!dark)}
          aria-label="Toggle dark mode"
          title={dark ? 'Switch to Classic Mode' : 'Switch to Dark Knight Mode'}
        >
          {dark ? '☀️' : '🦇'}
        </button>
      </div>
    </nav>
  );
}
