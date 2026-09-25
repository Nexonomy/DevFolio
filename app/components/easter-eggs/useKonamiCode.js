'use client';

import { useEffect, useRef } from 'react';

const KONAMI_CODE = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

export default function useKonamiCode(onUnlock, enabled = true) {
  const progressRef = useRef(0);
  const unlockRef = useRef(onUnlock);

  useEffect(() => {
    unlockRef.current = onUnlock;
  }, [onUnlock]);

  useEffect(() => {
    if (!enabled) return undefined;

    const handleKeyDown = (event) => {
      const target = event.target;
      if (target instanceof HTMLElement && (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))) return;

      const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
      const progress = progressRef.current;

      if (key === KONAMI_CODE[progress]) {
        progressRef.current += 1;
        if (progressRef.current === KONAMI_CODE.length) {
          progressRef.current = 0;
          unlockRef.current?.();
        }
        return;
      }

      progressRef.current = key === KONAMI_CODE[0] ? 1 : 0;
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enabled]);
}
