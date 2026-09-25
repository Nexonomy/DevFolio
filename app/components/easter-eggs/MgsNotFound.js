'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { playAlertTone } from './retroAudio';

const defaultEnabled = process.env.NEXT_PUBLIC_RETRO_EASTER_EGGS !== 'false';

export default function MgsNotFound({ enabled = defaultEnabled }) {
  useEffect(() => {
    if (!enabled) return;
    navigator.vibrate?.(80);
    playAlertTone();
  }, [enabled]);

  return (
    <main className="retro-not-found">
      {enabled ? <span className="mgs-alert-mark" aria-hidden="true">!</span> : null}
      <p className="saad-kicker">404 / Signal lost</p>
      <h1>Route not found.</h1>
      <p>The page slipped off the map. The rest of the portfolio is still operational.</p>
      <Link href="/#intro">Return to base <span aria-hidden="true">↙</span></Link>
    </main>
  );
}
