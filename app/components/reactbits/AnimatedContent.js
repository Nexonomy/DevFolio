'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Adapted from React Bits: AnimatedContent (CSS variant).
export default function AnimatedContent({
  children,
  distance = 34,
  direction = 'vertical',
  reverse = false,
  duration = 0.72,
  ease = 'power3.out',
  initialOpacity = 0,
  scale = 0.985,
  threshold = 0.12,
  delay = 0,
  className = '',
  ...props
}) {
  const ref = useRef(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return undefined;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
      gsap.set(element, { clearProps: 'all', visibility: 'visible' });
      return undefined;
    }

    gsap.registerPlugin(ScrollTrigger);
    const axis = direction === 'horizontal' ? 'x' : 'y';
    const offset = reverse ? -distance : distance;
    const startPercent = (1 - threshold) * 100;

    gsap.set(element, { [axis]: offset, scale, opacity: initialOpacity, visibility: 'visible' });
    const tween = gsap.to(element, {
      [axis]: 0,
      scale: 1,
      opacity: 1,
      duration,
      delay,
      ease,
      paused: true,
    });
    const trigger = ScrollTrigger.create({
      trigger: element,
      start: `top ${startPercent}%`,
      once: true,
      onEnter: () => tween.play(),
    });

    // Safety net: if ScrollTrigger never fires (element already past viewport, GSAP race,
    // crawler-sized viewport, etc.), reveal the content so it is never permanently invisible.
    const safety = window.setTimeout(() => {
      if (tween.progress() === 0) {
        gsap.set(element, { [axis]: 0, scale: 1, opacity: 1, visibility: 'visible', clearProps: 'transform,opacity' });
      }
    }, 1500);

    return () => {
      window.clearTimeout(safety);
      trigger.kill();
      tween.kill();
    };
  }, [delay, direction, distance, duration, ease, initialOpacity, reverse, scale, threshold]);

  return <div ref={ref} className={className} style={{ visibility: 'hidden' }} {...props}>{children}</div>;
}
