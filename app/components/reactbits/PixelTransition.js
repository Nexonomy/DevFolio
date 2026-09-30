'use client';

import { useEffect, useMemo, useRef } from 'react';
import { gsap } from 'gsap';
import './PixelTransition.css';

// Adapted from React Bits: PixelTransition, exposed as a controlled transition overlay.
export default function PixelTransition({ active, onMidpoint, onComplete, columns = 12, rows = 8 }) {
  const gridRef = useRef(null);
  const pixelCount = columns * rows;
  const pixels = useMemo(() => Array.from({ length: pixelCount }, (_, index) => index), [pixelCount]);

  useEffect(() => {
    if (!active || !gridRef.current) return undefined;
    const elements = gridRef.current.children;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
      onMidpoint?.();
      onComplete?.();
      return undefined;
    }

    gsap.set(gridRef.current, { visibility: 'visible' });
    gsap.set(elements, { scale: 0, opacity: 0 });
    const timeline = gsap.timeline({ onComplete });
    timeline.to(elements, {
      scale: 1.04,
      opacity: 1,
      duration: 0.04,
      stagger: { each: 0.009, from: 'random' },
      ease: 'none',
    });
    timeline.call(() => onMidpoint?.());
    timeline.to(elements, {
      scale: 0,
      opacity: 0,
      duration: 0.035,
      stagger: { each: 0.006, from: 'random' },
      ease: 'none',
    }, '+=0.08');

    return () => timeline.kill();
  }, [active, onComplete, onMidpoint]);

  if (!active) return null;
  return (
    <div ref={gridRef} className="pixel-transition-overlay" style={{ '--pixel-columns': columns, '--pixel-rows': rows }} aria-hidden="true">
      {pixels.map((index) => <i key={index} />)}
    </div>
  );
}
