'use client';

import { useEffect, useRef } from 'react';
import { animate, stagger } from 'animejs';

export default function ExperienceToolkit({ experiences = [] }) {
  const sectionRef = useRef(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      animate(section.querySelectorAll('.experience-toolkit-header > *'), {
        opacity: [0, 1],
        y: [22, 0],
        delay: stagger(90),
        duration: 700,
        ease: 'out(3)',
      });
      animate(section.querySelectorAll('.experience-path-item'), {
        opacity: [0, 1],
        x: [-24, 0],
        delay: stagger(105, { start: 180 }),
        duration: 680,
        ease: 'out(3)',
      });
      observer.disconnect();
    }, { threshold: 0.1 });

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} id="experience" className="section experience-toolkit-section experience-path-section" aria-labelledby="experience-title">
      <header className="experience-toolkit-header">
        <div><p className="section-label">The path so far</p><h2 id="experience-title" className="section-title">Experience <em>now & before.</em></h2></div>
        <div className="experience-range" aria-label="Timeline from now to 2023"><span>Latest first</span><strong>Now</strong><i /><strong>2023</strong></div>
      </header>

      <ol className="experience-path">
        {experiences.map((item, index) => (
          <li key={item.role} className={'experience-path-item' + (item.current ? ' is-current' : '')}>
            <time>{item.period}</time>
            <div className="experience-path-marker"><span aria-hidden="true">{item.icon}</span><i /></div>
            <article>
              <div className="experience-item-meta"><span>{item.type}</span>{item.current && <b>Current focus</b>}</div>
              <h3>{item.role}</h3>
              <p className="experience-organization">{item.organization}</p>
              <p>{item.description}</p>
            </article>
            <span className="experience-step" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}