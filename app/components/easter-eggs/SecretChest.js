'use client';

import { useState } from 'react';
import { playItemReveal } from './retroAudio';

const particles = Array.from({ length: 8 }, (_, index) => index);
const defaultEnabled = process.env.NEXT_PUBLIC_RETRO_EASTER_EGGS !== 'false';

export default function SecretChest({ enabled = defaultEnabled }) {
  const [open, setOpen] = useState(false);
  if (!enabled) return null;

  const revealItem = () => {
    if (open) return;
    setOpen(true);
    playItemReveal();
  };

  return (
    <div className={`secret-chest-wrap ${open ? 'is-open' : ''}`}>
      <button type="button" className="secret-chest" onClick={revealItem} aria-expanded={open} aria-label={open ? 'Pixel Heart found' : 'Open hidden treasure chest'}>
        <span className="secret-chest-lid" /><span className="secret-chest-base"><i /></span>
      </button>
      {open ? (
        <div className="secret-item-reveal" role="status">
          <div className="secret-pixel-heart"><i /><i /><i /><i /><i /><i /></div>
          <p><b>Pixel Heart found</b><span>Curiosity +1</span></p>
          <div className="secret-particles" aria-hidden="true">{particles.map((particle) => <i style={{ '--particle': particle }} key={particle} />)}</div>
        </div>
      ) : <small>Something is hidden here.</small>}
    </div>
  );
}
