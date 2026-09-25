'use client';

import { useCallback, useEffect, useRef } from 'react';

// Adapted from React Bits: ClickSpark. The canvas is viewport-fixed so it stays lightweight on a long page.
export default function ClickSpark({
  children,
  sparkColor = '#e65f2b',
  sparkSize = 8,
  sparkRadius = 18,
  sparkCount = 7,
  duration = 380,
}) {
  const canvasRef = useRef(null);
  const sparksRef = useRef([]);
  const animationRef = useRef(null);

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(window.innerWidth * ratio);
    canvas.height = Math.round(window.innerHeight * ratio);
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    canvas.getContext('2d')?.setTransform(ratio, 0, 0, ratio, 0, 0);
  }, []);

  useEffect(() => {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas, { passive: true });
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [resizeCanvas]);

  useEffect(() => () => cancelAnimationFrame(animationRef.current), []);

  function draw(timestamp) {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return;
    context.clearRect(0, 0, window.innerWidth, window.innerHeight);
    sparksRef.current = sparksRef.current.filter((spark) => {
      const progress = (timestamp - spark.startTime) / duration;
      if (progress >= 1) return false;
      const eased = progress * (2 - progress);
      const distance = eased * sparkRadius;
      const lineLength = sparkSize * (1 - eased);
      const x1 = spark.x + distance * Math.cos(spark.angle);
      const y1 = spark.y + distance * Math.sin(spark.angle);
      context.strokeStyle = sparkColor;
      context.lineWidth = 1.6;
      context.beginPath();
      context.moveTo(x1, y1);
      context.lineTo(x1 + lineLength * Math.cos(spark.angle), y1 + lineLength * Math.sin(spark.angle));
      context.stroke();
      return true;
    });
    if (sparksRef.current.length) animationRef.current = requestAnimationFrame(draw);
  }

  const handleClick = (event) => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (!event.target.closest('a, button, .other-card')) return;
    const now = performance.now();
    sparksRef.current.push(...Array.from({ length: sparkCount }, (_, index) => ({
      x: event.clientX,
      y: event.clientY,
      angle: (2 * Math.PI * index) / sparkCount,
      startTime: now,
    })));
    cancelAnimationFrame(animationRef.current);
    animationRef.current = requestAnimationFrame(draw);
  };

  return (
    <div className="click-spark-root" onClick={handleClick}>
      <canvas ref={canvasRef} className="click-spark-canvas" aria-hidden="true" />
      {children}
    </div>
  );
}
