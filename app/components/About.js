'use client';

import { useEffect, useRef } from 'react';
import { animate, stagger } from 'animejs';

const stats = [
  { name: 'Unity / C#', value: 92 },
  { name: 'Pixel Art', value: 85 },
  { name: 'Game Design', value: 88 },
  { name: 'Unreal / C++', value: 72 },
  { name: 'UI/UX Design', value: 78 },
];

export default function About() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animate('.stat-bar-fill', {
              width: (el) => el.getAttribute('data-width') + '%',
              duration: 1200,
              easing: 'outCubic',
              delay: stagger(100),
            });
            observer.disconnect();
          }
        });
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section id="about" className="section about-section" ref={sectionRef}>
      <p className="section-label">♦ CHARACTER SHEET ♦</p>
      <h2 className="section-title">ABOUT ME</h2>

      <div className="about-grid">
        <div className="avatar-box">
          <div className="avatar-icon">🎮</div>
          <p className="avatar-name">AHSAN TARIQ</p>
          <p className="avatar-role">Game Developer &amp; Designer</p>
        </div>

        <div className="about-text">
          <p>
            With a passion forged in the fires of 8-bit classics, I bring together 
            game design, programming, and pixel artistry to create memorable interactive 
            experiences. Every game I craft is a carefully balanced blend of tight mechanics, 
            compelling narrative, and visual charm.
          </p>
          <p>
            From prototyping core loops in Unity to polishing final pixel art frames, 
            I handle the full stack of game development. I believe the best games feel 
            handcrafted — where every jump, every puzzle, every line of dialogue serves 
            the player&apos;s journey.
          </p>

          <div className="stat-bars">
            {stats.map((stat, i) => (
              <div key={i} className="stat-bar-item">
                <div className="stat-bar-label">
                  <span>{stat.name}</span>
                  <span>{stat.value}</span>
                </div>
                <div className="stat-bar-track">
                  <div
                    className="stat-bar-fill"
                    data-width={stat.value}
                    style={{ width: 0 }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
