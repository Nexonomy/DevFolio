'use client';

import { useEffect } from 'react';
import { animate, createTimeline } from 'animejs';
import ThreeBackground from './ThreeBackground';

function PixelKnight() {
  return (
    <svg width="64" height="80" viewBox="0 0 64 80" className="hero-sprite" style={{ imageRendering: 'pixelated' }}>
      {/* Helmet */}
      <rect x="20" y="0" width="24" height="8" fill="#8B2E1A" />
      <rect x="16" y="8" width="32" height="8" fill="#8B2E1A" />
      <rect x="24" y="4" width="16" height="4" fill="#C8860A" />
      {/* Face */}
      <rect x="20" y="16" width="24" height="12" fill="#C4A265" />
      <rect x="24" y="20" width="4" height="4" fill="#3B2A1A" />
      <rect x="36" y="20" width="4" height="4" fill="#3B2A1A" />
      {/* Body */}
      <rect x="16" y="28" width="32" height="20" fill="#3B2A1A" />
      <rect x="20" y="32" width="24" height="12" fill="#5C3D2A" />
      <rect x="8" y="30" width="8" height="14" fill="#3B2A1A" />
      <rect x="48" y="30" width="8" height="14" fill="#3B2A1A" />
      {/* Belt */}
      <rect x="18" y="46" width="28" height="4" fill="#C8860A" />
      {/* Legs */}
      <rect x="18" y="50" width="12" height="16" fill="#2D5016" />
      <rect x="34" y="50" width="12" height="16" fill="#2D5016" />
      {/* Boots */}
      <rect x="16" y="66" width="14" height="6" fill="#3B2A1A" />
      <rect x="34" y="66" width="14" height="6" fill="#3B2A1A" />
      {/* Sword */}
      <rect x="52" y="18" width="4" height="24" fill="#999" />
      <rect x="48" y="42" width="12" height="4" fill="#C8860A" />
      <rect x="54" y="14" width="2" height="4" fill="#C4C4C4" />
    </svg>
  );
}

export default function Hero() {
  useEffect(() => {
    const tl = createTimeline({ defaults: { easing: 'outExpo' } });

    tl.add('.hero-eyebrow', {
      opacity: [0, 1],
      translateY: [20, 0],
      duration: 700,
    })
    .add('.hero-sprite', {
      opacity: [0, 1],
      translateY: [30, 0],
      duration: 600,
    }, '-=400')
    .add('.hero-name', {
      opacity: [0, 1],
      translateY: [24, 0],
      duration: 700,
    }, '-=300')
    .add('.hero-subtitle', {
      opacity: [0, 1],
      translateY: [20, 0],
      duration: 600,
    }, '-=300')
    .add('.hero-cta', {
      opacity: [0, 1],
      translateY: [16, 0],
      duration: 600,
    }, '-=200');

    // Sprite walk animation
    animate('.hero-sprite', {
      translateY: [-4, 4],
      alternate: true,
      loop: true,
      duration: 420,
      easing: 'inOutSine',
    });
  }, []);

  return (
    <section id="hero" className="hero">
      <ThreeBackground />
      <div className="pixel-deco"></div>
      <div className="pixel-deco"></div>
      <div className="pixel-deco"></div>
      <div className="pixel-deco"></div>
      <div className="pixel-deco"></div>

      <div className="hero-content">
        <p className="hero-eyebrow">GAME DEVELOPER &amp; DESIGNER</p>
        <PixelKnight />
        <h1 className="hero-name">AHSAN TARIQ</h1>
        <p className="hero-subtitle">Crafting worlds, one pixel at a time.</p>
        <a href="#work" className="hero-cta">VIEW MY QUEST LOG ▶</a>
      </div>
    </section>
  );
}
