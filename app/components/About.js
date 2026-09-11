/* eslint-disable @next/next/no-img-element */
'use client';

import { useEffect, useRef } from 'react';
import { animate, stagger } from 'animejs';

export default function About({ profile }) {
  const sectionRef = useRef(null);
  const tools = profile.tools || [];
  const values = profile.values || [];

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      animate(section.querySelectorAll('.about-reveal'), { opacity: [0, 1], y: [28, 0], delay: stagger(95), duration: 720, ease: 'out(3)' });
      animate(section.querySelectorAll('.tool-icon-card'), { opacity: [0, 1], scale: [0.78, 1], rotate: [3, 0], delay: stagger(34, { start: 300, from: 'center' }), duration: 560, ease: 'out(4)' });
      observer.disconnect();
    }, { threshold: 0.1 });
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  const titleParts = profile.bioTitle.split('&');
  return <section ref={sectionRef} id="about" className="section about-section human-about-section" aria-labelledby="about-title">
    <p className="section-label about-reveal">The human bit</p>
    <div className="about-grid">
      <div className="about-reveal">
        <h2 id="about-title" className="section-title">{titleParts[0].trim()} {titleParts.length > 1 && <><br /><em>& {titleParts.slice(1).join('&').trim()}</em></>}</h2>
{profile.profileImageUrl && <figure className="about-portrait"><img src={profile.profileImageUrl} alt={profile.name + ' portrait'} /><span aria-hidden="true">✦</span></figure>}
                <p className="about-signature">{profile.name} <span aria-hidden="true">↗</span></p>
      </div>
      <div className="about-text about-reveal">
        {profile.bioParagraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
        <ul className="about-values" aria-label="Creative values">{values.map((value) => <li key={value}>{value}</li>)}</ul>
      </div>
    </div>
    <div id="tools" className="human-toolkit ungrouped-toolkit" aria-labelledby="human-toolkit-title">
      <header className="human-toolkit-intro about-reveal">
        <p>Creative inventory</p><h3 id="human-toolkit-title">What I make with.</h3>
        <span>No strict lanes. I mix code, art, interaction, and motion around whatever the idea needs.</span>
        <div className="toolkit-stamp" aria-hidden="true"><strong>{tools.length}</strong><small>tools<br />in rotation</small></div>
      </header>
      <div className="tool-icon-grid" aria-label="Tools and creative software">{tools.map((tool, index) => <div key={tool.name + index} className="tool-icon-card" style={{ '--tool-order': index }}><span className="tool-glyph" aria-hidden="true">{tool.icon}</span><strong>{tool.name}</strong></div>)}</div>
    </div>
  </section>;
}