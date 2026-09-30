'use client';

import { useEffect, useMemo, useRef } from 'react';
import { gsap } from 'gsap';
import './PixelTransition.css';

// Adapted from React Bits: PixelTransition, exposed as a controlled transition overlay.
export default function PixelTransition({ active, onMidpoint, onComplete, columns = 12, rows = 8, variant = 'scatter' }) {
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

    const grid = [rows, columns];
    const diagonalDelay = (index) => {
      const row = Math.floor(index / columns);
      const column = index % columns;
      return (row + column) * 0.028;
    };
    const checkerDelay = (index) => {
      const row = Math.floor(index / columns);
      const column = index % columns;
      const checkerPhase = (row + column) % 2;
      const distanceFromCenter = Math.abs(column - (columns - 1) / 2);
      return checkerPhase * 0.16 + distanceFromCenter * 0.018 + row * 0.01;
    };
    const animations = {
      scatter: {
        initial:{ scale:0, opacity:0, rotation:18 },
        enter:{ scale:1.04, opacity:1, rotation:0, duration:0.055, stagger:{ amount:0.68, from:'random' }, ease:'power2.out' },
      },
      checker: {
        initial:{ scale:0.82, rotationY:-90, opacity:0, transformPerspective:600 },
        enter:{ scale:1.04, rotationY:0, opacity:1, duration:0.12, stagger:checkerDelay, ease:'back.out(1.25)' },
      },
      iris: {
        initial:{ scale:0, opacity:0, borderRadius:'50%' },
        enter:{ scale:1.08, opacity:1, borderRadius:'12%', duration:0.08, stagger:{ amount:0.74, grid, from:'center' }, ease:'back.out(1.35)' },
      },
      cascade: {
        initial:{ scaleY:0, opacity:1, transformOrigin:'top center' },
        enter:{ scaleY:1.04, duration:0.07, stagger:diagonalDelay, ease:'power2.out' },
      },
    };
    const animation = animations[variant] || animations.scatter;

    gsap.set(gridRef.current, { visibility:'visible', opacity:1 });
    gsap.set(elements, animation.initial);
    const timeline = gsap.timeline({ onComplete });
    timeline.to(elements, animation.enter);
    timeline.call(() => onMidpoint?.());
    timeline.to(gridRef.current, { opacity:0, duration:0.32, ease:'power2.out' }, '+=0.12');

    return () => timeline.kill();
  }, [active, columns, onComplete, onMidpoint, rows, variant]);

  if (!active) return null;
  return (
    <div ref={gridRef} className={`pixel-transition-overlay is-${variant}`} data-transition={variant} style={{ '--pixel-columns': columns, '--pixel-rows': rows }} aria-hidden="true">
      {pixels.map((index) => <i key={index} />)}
    </div>
  );
}
