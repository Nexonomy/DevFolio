'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

export default function MotionLayer() {
  const pathname = usePathname();
  const dot = useRef(null);
  const ring = useRef(null);
  const cursor = useRef(null);
  const progress = useRef(null);

  useEffect(() => {
    if (pathname.startsWith('/admin')) return;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finePointer = window.matchMedia('(pointer: fine)').matches;
    const pixelCursor = finePointer;
    document.documentElement.classList.add('motion-ready');
    document.documentElement.classList.toggle('has-pixel-cursor', pixelCursor);

    const revealItems = document.querySelectorAll('.hero-copy,.hero-portrait,.hero-details,.section,.game-detail-hero,.game-detail-section');
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    }), { threshold:0.08, rootMargin:'0px 0px -5% 0px' });
    revealItems.forEach((item) => observer.observe(item));

    let frame;
    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let ringX = targetX;
    let ringY = targetY;
    const draw = () => {
      ringX += (targetX - ringX) * 0.16;
      ringY += (targetY - ringY) * 0.16;
      if (dot.current) dot.current.style.transform = `translate3d(${targetX}px,${targetY}px,0)`;
      if (ring.current) ring.current.style.transform = `translate3d(${ringX}px,${ringY}px,0)`;
      if (cursor.current) cursor.current.style.transform = `translate3d(${targetX}px,${targetY}px,0)`;
      frame = requestAnimationFrame(draw);
    };
    const move = (event) => {
      targetX = event.clientX;
      targetY = event.clientY;
      dot.current?.classList.add('is-visible');
      ring.current?.classList.add('is-visible');
      ring.current?.classList.toggle('is-over-link', Boolean(event.target.closest('a,button')));
      cursor.current?.classList.add('is-visible');
      cursor.current?.classList.toggle('is-over-link', Boolean(event.target.closest('a,button')));
    };
    const click = () => {
      ring.current?.classList.remove('is-clicked');
      cursor.current?.classList.remove('is-clicked');
      requestAnimationFrame(() => {
        ring.current?.classList.add('is-clicked');
        cursor.current?.classList.add('is-clicked');
      });
    };
    const scroll = () => {
      const available = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = available > 0 ? Math.min(window.scrollY / available, 1) : 0;
      if (progress.current) progress.current.style.transform = `scaleY(${ratio})`;
    };

    if (finePointer && !reduceMotion) {
      window.addEventListener('pointermove', move, { passive:true });
      window.addEventListener('pointerdown', click, { passive:true });
      frame = requestAnimationFrame(draw);
    }
    window.addEventListener('scroll', scroll, { passive:true });
    scroll();
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerdown', click);
      window.removeEventListener('scroll', scroll);
      document.documentElement.classList.remove('motion-ready');
      document.documentElement.classList.remove('has-pixel-cursor');
    };
  }, [pathname]);

  if (pathname.startsWith('/admin')) return null;
  return <div className="motion-layer" aria-hidden="true">
    <span ref={dot} className="cursor-dot" />
    <span ref={ring} className="cursor-ring" />
    <span ref={cursor} className="cursor-pokeball">
      <svg viewBox="0 0 24 24" role="presentation" shapeRendering="crispEdges">
        <path className="pokeball-outline" d="M7 1h10v2h4v4h2v10h-2v4h-4v2H7v-2H3v-4H1V7h2V3h4z" />
        <path className="pokeball-top" d="M7 3h10v2h4v6H3V7h2V5h2z" />
        <path className="pokeball-bottom" d="M3 13h18v4h-2v2h-3v2H8v-2H5v-2H3z" />
        <path className="pokeball-band" d="M3 10h18v4H3z" />
        <path className="pokeball-button" d="M9 9h6v2h2v4h-2v2H9v-2H7v-4h2z" />
        <path className="pokeball-button-core" d="M10 11h4v4h-4z" />
      </svg>
    </span>
    <span className="scroll-rail"><i ref={progress} /></span>
  </div>;
}
