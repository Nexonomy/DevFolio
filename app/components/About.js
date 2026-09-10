'use client';

import { useEffect, useRef } from 'react';
import { animate, stagger } from 'animejs';

const tools = [
  { name: 'Unity', icon: '◈' },
  { name: 'Unreal Engine', icon: 'U' },
  { name: 'Godot', icon: '♙' },
  { name: 'C#', icon: '#C' },
  { name: 'C++', icon: '++' },
  { name: 'GDScript', icon: 'Gd' },
  { name: 'Blender', icon: '◒' },
  { name: 'Pixel Art', icon: '▦' },
  { name: 'Shader Graph', icon: '⌁' },
  { name: 'UI / UX', icon: '◎' },
  { name: 'Game Design', icon: '♟' },
  { name: 'After Effects', icon: 'Ae' },
  { name: 'TouchDesigner', icon: '✣' },
  { name: 'Motion Design', icon: '↝' },
  { name: 'Sound Design', icon: '♫' },
  { name: 'WebSockets', icon: '⇄' },
];

const values = ['Player-first thinking', 'Curious systems', 'Visual storytelling'];

export default function About() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      animate(section.querySelectorAll('.about-reveal'), {
        opacity: [0, 1],
        y: [28, 0],
        delay: stagger(95),
        duration: 720,
        ease: 'out(3)',
      });
      animate(section.querySelectorAll('.tool-icon-card'), {
        opacity: [0, 1],
        scale: [0.78, 1],
        rotate: [3, 0],
        delay: stagger(34, { start: 300, from: 'center' }),
        duration: 560,
        ease: 'out(4)',
      });
      observer.disconnect();
    }, { threshold: 0.1 });

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} id="about" className="section about-section human-about-section" aria-labelledby="about-title">
      <p className="section-label about-reveal">The human bit</p>
      <div className="about-grid">
        <div className="about-reveal">
          <h2 id="about-title" className="section-title">Equal parts<br /><em>player & maker.</em></h2>
          <p className="about-signature">Ahsan Tariq <span aria-hidden="true">↗</span></p>
        </div>
        <div className="about-text about-reveal">
          <p>My love for games started with 8-bit classics. Today, I bring design, programming, and pixel artistry together to build experiences with tight mechanics, compelling stories, and visual charm.</p>
          <p>From prototyping core loops in Unity to polishing the final frames, I care about how every detail feels in the player’s hands. Every jump, puzzle, and line of dialogue should serve the journey.</p>
          <ul className="about-values" aria-label="Creative values">{values.map(value => <li key={value}>{value}</li>)}</ul>
        </div>
      </div>

      <div id="tools" className="human-toolkit ungrouped-toolkit" aria-labelledby="human-toolkit-title">
        <header className="human-toolkit-intro about-reveal">
          <p>Creative inventory</p>
          <h3 id="human-toolkit-title">What I make with.</h3>
          <span>No strict lanes. I mix code, art, interaction, and motion around whatever the idea needs.</span>
          <div className="toolkit-stamp" aria-hidden="true"><strong>{tools.length}</strong><small>tools<br />in rotation</small></div>
        </header>
        <div className="tool-icon-grid" aria-label="Tools and creative software">
          {tools.map((tool, index) => (
            <div key={tool.name} className="tool-icon-card" style={{ '--tool-order': index }}>
              <span className="tool-glyph" aria-hidden="true">{tool.icon}</span>
              <strong>{tool.name}</strong>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
