'use client';

import { useEffect, useMemo, useRef } from 'react';
import './PixelTransition.css';

// GSAP is only needed when a transition plays, so it stays out of the initial bundle.
let gsapPromise;
const loadGsap = () => (gsapPromise ??= import('gsap').then((module) => module.gsap || module.default));

// Adapted from React Bits: PixelTransition, exposed as a controlled transition overlay.
export default function PixelTransition({ active, reveal = false, onMidpoint, onComplete, columns = 12, rows = 8, variant = 'scatter' }) {
  const gridRef = useRef(null);
  const timelineRef = useRef(null);
  const waitingToRevealRef = useRef(false);
  const revealRef = useRef(reveal);
  const reducedMotionRef = useRef(false);
  const pixelCount = columns * rows;
  const pixels = useMemo(() => Array.from({ length: pixelCount }, (_, index) => index), [pixelCount]);

  useEffect(() => {
    const warm = () => { loadGsap().catch(() => {}); };
    if ('requestIdleCallback' in window) {
      const id = window.requestIdleCallback(warm, { timeout: 6000 });
      return () => window.cancelIdleCallback(id);
    }
    const id = window.setTimeout(warm, 3000);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    revealRef.current = reveal;
    if (!reveal || !waitingToRevealRef.current) return;
    waitingToRevealRef.current = false;
    if (reducedMotionRef.current) onComplete?.();
    else timelineRef.current?.play();
  }, [onComplete, reveal]);

  useEffect(() => {
    if (!active || !gridRef.current) return undefined;
    const elements = gridRef.current.children;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    reducedMotionRef.current = reduceMotion;
    waitingToRevealRef.current = false;
    if (reduceMotion) {
      waitingToRevealRef.current = true;
      onMidpoint?.();
      if (revealRef.current) {
        waitingToRevealRef.current = false;
        onComplete?.();
      }
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
      return checkerPhase * 0.1 + distanceFromCenter * 0.012 + row * 0.006;
    };
    const animations = {
      scatter: {
        initial:{ scale:0, opacity:0, rotation:18 },
        enter:{ scale:1.04, opacity:1, rotation:0, duration:0.05, stagger:{ amount:0.48, from:'random' }, ease:'power2.out' },
      },
      checker: {
        initial:{ scale:0.82, rotationY:-90, opacity:0, transformPerspective:600 },
        enter:{ scale:1.04, rotationY:0, opacity:1, duration:0.1, stagger:checkerDelay, ease:'back.out(1.25)' },
      },
      iris: {
        initial:{ scale:0, opacity:0, borderRadius:'50%' },
        enter:{ scale:1.08, opacity:1, borderRadius:'12%', duration:0.07, stagger:{ amount:0.5, grid, from:'center' }, ease:'back.out(1.35)' },
      },
      cascade: {
        initial:{ scaleY:0, opacity:1, transformOrigin:'top center' },
        enter:{ scaleY:1.04, duration:0.06, stagger:(index) => diagonalDelay(index) * 0.65, ease:'power2.out' },
      },
    };
    const animation = animations[variant] || animations.scatter;

    let disposed = false;
    let timeline = null;
    loadGsap().then((gsap) => {
      if (disposed || !gridRef.current) return;
      gsap.set(gridRef.current, { visibility:'visible', opacity:1 });
      gsap.set(elements, animation.initial);
      timeline = gsap.timeline({ onComplete });
      timelineRef.current = timeline;
      timeline.to(elements, animation.enter);
      timeline.call(() => {
        waitingToRevealRef.current = true;
        onMidpoint?.();
        if (revealRef.current) waitingToRevealRef.current = false;
        else timeline.pause();
      });
      timeline.to(gridRef.current, { opacity:0, duration:0.24, ease:'power2.out' }, '+=0.06');
    }).catch(() => {
      // If the animation library can't load, still navigate and finish.
      if (disposed) return;
      onMidpoint?.();
      onComplete?.();
    });

    return () => {
      disposed = true;
      waitingToRevealRef.current = false;
      timelineRef.current = null;
      timeline?.kill();
    };
  }, [active, columns, onComplete, onMidpoint, rows, variant]);

  if (!active) return null;
  return (
    <div ref={gridRef} className={`pixel-transition-overlay is-${variant}`} data-transition={variant} style={{ '--pixel-columns': columns, '--pixel-rows': rows }} aria-hidden="true">
      {pixels.map((index) => <i key={index} />)}
    </div>
  );
}
