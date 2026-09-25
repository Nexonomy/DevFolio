'use client';

import { useCallback, useEffect, useState } from 'react';
import useKonamiCode from './useKonamiCode';
import { playOneUp } from './retroAudio';

const scanlines = Array.from({ length: 20 }, (_, index) => index);
const defaultEnabled = process.env.NEXT_PUBLIC_RETRO_EASTER_EGGS !== 'false';

function logDeveloperLore(name) {
  console.log('%c ROBCO INDUSTRIES (TM) TERMLINK PROTOCOL ', 'background:#15301f;color:#7cff8d;padding:4px 8px;font-weight:bold;');
  console.log(`%c> USER: ${name}\n> CLASS: GAME DEVELOPER\n> STATUS: BUILDING PLAYABLE WORLDS`, 'color:#7cff8d;font-family:monospace;line-height:1.6;');
  console.log('%c[APERTURE] The cake is a lie. The portfolio is real.', 'color:#ffb34f;font-family:monospace;');
  console.log('%cHint: ↑ ↑ ↓ ↓ ← → ← → B A', 'color:#777;font-family:monospace;');
}

export default function RetroEasterEggs({ name = 'AHSAN TARIQ', enabled = defaultEnabled }) {
  const [unlocked, setUnlocked] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (enabled) logDeveloperLore(name.toUpperCase());
  }, [enabled, name]);

  useEffect(() => {
    if (!showOverlay && !showToast) return undefined;
    const overlayTimer = window.setTimeout(() => setShowOverlay(false), 1150);
    const toastTimer = window.setTimeout(() => setShowToast(false), 3000);
    return () => {
      window.clearTimeout(overlayTimer);
      window.clearTimeout(toastTimer);
    };
  }, [showOverlay, showToast]);

  const unlock = useCallback(() => {
    setUnlocked(true);
    setShowOverlay(true);
    setShowToast(true);
    playOneUp();
    window.dispatchEvent(new CustomEvent('retro:overclocked'));
  }, []);

  useKonamiCode(unlock, enabled);
  if (!enabled) return null;

  return (
    <>
      {showOverlay ? <div className="retro-crt-overlay" aria-hidden="true">{scanlines.map((line) => <i key={line} />)}</div> : null}
      {showToast ? <div className="retro-unlock-toast" role="status"><b>1UP!</b><span>Secret Retro Mode Unlocked</span></div> : null}
      {unlocked ? <span className="retro-one-up-badge" aria-label="Secret retro mode unlocked" title="Secret retro mode unlocked">1UP</span> : null}
    </>
  );
}
