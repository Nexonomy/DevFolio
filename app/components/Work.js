'use client';

import { useEffect, useRef } from 'react';
import { animate, stagger } from 'animejs';

const projects = [
  {
    emoji: '🏃',
    bg: '#4A7C2F',
    tag: 'PLATFORMER',
    title: 'Realm Runners',
    description: 'A fast-paced pixel platformer with procedurally generated levels, wall-jumping mechanics, and a retro synthwave soundtrack. Race through crumbling castles and ancient forests.',
    tech: 'Unity · C# · Pixel Art',
    year: '2025',
  },
  {
    emoji: '⚔️',
    bg: '#8B2E1A',
    tag: 'RPG',
    title: 'Chronicle of Embers',
    description: 'A top-down action RPG featuring a branching narrative, hand-drawn pixel art, and a dynamic weather system that affects gameplay and story outcomes.',
    tech: 'Unreal Engine · C++ · Blueprints',
    year: '2024',
  },
  {
    emoji: '🧩',
    bg: '#C8860A',
    tag: 'PUZZLE',
    title: 'Glyph Garden',
    description: 'A meditative puzzle game where players arrange ancient runes to restore magical gardens. Features 120 hand-crafted levels with increasing complexity.',
    tech: 'Unity · C# · Shader Graph',
    year: '2024',
  },
  {
    emoji: '🏰',
    bg: '#3B2A1A',
    tag: 'STRATEGY',
    title: 'Bastion Command',
    description: 'A real-time strategy game set in a medieval fantasy world. Build fortresses, command armies, and defend your realm against waves of darkness.',
    tech: 'Godot · GDScript · Multiplayer',
    year: '2023',
  },
];

export default function Work() {
  const sectionRef = useRef(null);
  const cardsRef = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animate('.project-card', {
              opacity: [0, 1],
              translateY: [40, 0],
              delay: stagger(120),
              easing: 'outBack',
              duration: 800,
            });
            observer.disconnect();
          }
        });
      },
      { threshold: 0.15 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleCardHover = (index) => {
    const coinEl = cardsRef.current[index]?.querySelector('.coin-pop');
    if (coinEl) {
      animate(coinEl, {
        opacity: [0, 1, 0],
        translateY: [0, -42],
        duration: 900,
        easing: 'outCubic',
      });
    }
  };

  return (
    <section id="work" className="section work-section" ref={sectionRef}>
      <p className="section-label">★ QUEST LOG ★</p>
      <h2 className="section-title">MY GAMES</h2>

      <div className="work-grid">
        {projects.map((project, i) => (
          <div
            key={i}
            className="project-card"
            ref={(el) => (cardsRef.current[i] = el)}
            onMouseEnter={() => handleCardHover(i)}
          >
            <div className="coin-pop">+100 ☆</div>
            <div className="card-thumbnail" style={{ background: project.bg }}>
              <span>{project.emoji}</span>
              <span className="card-tag">{project.tag}</span>
            </div>
            <div className="card-body">
              <h3 className="card-title">{project.title}</h3>
              <p className="card-description">{project.description}</p>
              <p className="card-tech">{project.tech}</p>
              <button className="card-button">▶ VIEW</button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
