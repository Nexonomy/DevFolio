'use client';

import { useEffect, useRef } from 'react';

const EASE = 'cubic-bezier(.215,.61,.355,1)';

// Adapted from React Bits: AnimatedContent, using IntersectionObserver and CSS transitions instead of GSAP.
// Content is visible by default; only elements still below the fold get hidden, then revealed on scroll.
export default function AnimatedContent({
  children,
  distance = 34,
  direction = 'vertical',
  reverse = false,
  duration = 0.72,
  ease: _ease,
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
    if (!element || !('IntersectionObserver' in window)) return undefined;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    if (element.getBoundingClientRect().top < window.innerHeight * (1 - threshold)) return undefined;

    const axis = direction === 'horizontal' ? 'X' : 'Y';
    const offset = reverse ? -distance : distance;
    element.style.opacity = String(initialOpacity);
    element.style.transform = `translate${axis}(${offset}px) scale(${scale})`;

    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      observer.disconnect();
      element.style.transition = `opacity ${duration}s ${EASE} ${delay}s, transform ${duration}s ${EASE} ${delay}s`;
      void element.offsetHeight;
      element.style.opacity = '';
      element.style.transform = '';
    }, { rootMargin: `0px 0px -${Math.round(threshold * 100)}% 0px` });
    observer.observe(element);

    return () => {
      observer.disconnect();
      element.style.opacity = '';
      element.style.transform = '';
      element.style.transition = '';
    };
  }, [delay, direction, distance, duration, initialOpacity, reverse, scale, threshold]);

  return <div ref={ref} className={className} {...props}>{children}</div>;
}
