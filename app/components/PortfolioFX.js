'use client';

import { useEffect, useRef, useState } from 'react';

export default function PortfolioFX() {
  const [sound, setSound] = useState(false);
  const audioRef = useRef(null);
  const lastPingRef = useRef(0);

  useEffect(() => {
    const root = document.documentElement;
    document.body.classList.add('has-custom-cursor');
    const cursor = document.querySelector('.cursor-reticle');

    const updateScroll = () => {
      const max = Math.max(1, root.scrollHeight - innerHeight);
      root.style.setProperty('--scroll-progress', `${scrollY / max}`);
    };
    const moveCursor = (event) => {
      if (!cursor) return;
      cursor.style.setProperty('--cursor-x', `${event.clientX}px`);
      cursor.style.setProperty('--cursor-y', `${event.clientY}px`);
      cursor.dataset.active = event.target.closest('a,button,summary') ? 'true' : 'false';
    };
    updateScroll();
    addEventListener('scroll', updateScroll, { passive: true });
    addEventListener('pointermove', moveCursor, { passive: true });
    return () => {
      document.body.classList.remove('has-custom-cursor');
      removeEventListener('scroll', updateScroll);
      removeEventListener('pointermove', moveCursor);
      audioRef.current?.close();
    };
  }, []);

  useEffect(() => {
    if (!sound) return;
    const ping = (event) => {
      if (!event.target.closest('a,button,summary')) return;
      const now = performance.now();
      if (now - lastPingRef.current < 55) return;
      lastPingRef.current = now;
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const context = audioRef.current || new AudioContext();
      audioRef.current = context;
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(event.type === 'click' ? 520 : 360, context.currentTime);
      gain.gain.setValueAtTime(0.018, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.055);
      oscillator.connect(gain).connect(context.destination);
      oscillator.start();
      oscillator.stop(context.currentTime + 0.06);
    };
    document.addEventListener('pointerover', ping);
    document.addEventListener('click', ping);
    return () => {
      document.removeEventListener('pointerover', ping);
      document.removeEventListener('click', ping);
    };
  }, [sound]);

  return <>
    <div className="cursor-reticle" aria-hidden="true"><i /></div>
    <button type="button" className="sound-orb" onClick={() => setSound(value => !value)} aria-pressed={sound} aria-label={`${sound ? 'Disable' : 'Enable'} interface sounds`}>
      <span aria-hidden="true">{sound ? '♫' : '♪'}</span>{sound ? 'sound on' : 'sound off'}
    </button>
  </>;
}

