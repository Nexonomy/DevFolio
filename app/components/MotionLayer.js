'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

export default function MotionLayer() {
  const pathname = usePathname();
  const dot = useRef(null);
  const ring = useRef(null);
  const progress = useRef(null);

  useEffect(() => {
    if (pathname.startsWith('/admin')) return;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finePointer = window.matchMedia('(pointer: fine)').matches;
    document.documentElement.classList.add('motion-ready');

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
      frame = requestAnimationFrame(draw);
    };
    const move = (event) => {
      targetX = event.clientX;
      targetY = event.clientY;
      dot.current?.classList.add('is-visible');
      ring.current?.classList.add('is-visible');
      ring.current?.classList.toggle('is-over-link', Boolean(event.target.closest('a,button')));
    };
    const click = () => {
      ring.current?.classList.remove('is-clicked');
      requestAnimationFrame(() => ring.current?.classList.add('is-clicked'));
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
    };
  }, [pathname]);

  if (pathname.startsWith('/admin')) return null;
  return <div className="motion-layer" aria-hidden="true"><span ref={dot} className="cursor-dot" /><span ref={ring} className="cursor-ring" /><span className="scroll-rail"><i ref={progress} /></span></div>;
}
