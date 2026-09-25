'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import AnimatedContent from './reactbits/AnimatedContent';
import GlareHover from './reactbits/GlareHover';
import GameEasterEgg from './easter-eggs/GameEasterEgg';

const placeholderCovers = [
  '/project-placeholders/magic-student.png',
  '/project-placeholders/luggage-character.png',
];

export default function OtherProjects({ projects = [], title = 'Additional Projects', description = 'Selected creative and technical work beyond game development.' }) {
  const track = useRef(null);
  const drag = useRef({ active:false, startX:0, scrollLeft:0, moved:false });
  const [isDragging, setIsDragging] = useState(false);
  const [activeType, setActiveType] = useState('All');
  const projectTypes = ['All', ...new Set(projects.map((project) => project.tag).filter(Boolean))];
  const visibleProjects = activeType === 'All' ? projects : projects.filter((project) => project.tag === activeType);

  useEffect(() => {
    track.current?.scrollTo({ left: 0, behavior: 'smooth' });
  }, [activeType]);

  if (!projects.length) return null;
  const move = (direction) => {
    const element = track.current;
    const card = element?.querySelector('.other-card');
    if (!element || !card) return;
    element.scrollBy({ left: direction * (card.getBoundingClientRect().width + 14), behavior: 'smooth' });
  };
  const startDrag = (event) => {
    if (event.pointerType === 'touch') return;
    drag.current = { active:true, startX:event.clientX, scrollLeft:track.current.scrollLeft, moved:false };
    setIsDragging(true);
  };
  const dragTrack = (event) => {
    if (!drag.current.active) return;
    const distance = event.clientX - drag.current.startX;
    if (Math.abs(distance) > 5) drag.current.moved = true;
    track.current.scrollLeft = drag.current.scrollLeft - distance;
  };
  const stopDrag = (event) => {
    if (!drag.current.active) return;
    drag.current.active = false;
    setIsDragging(false);
  };
  const protectLinks = (event) => {
    if (drag.current.moved) {
      event.preventDefault();
      event.stopPropagation();
      drag.current.moved = false;
    }
  };
  return <section id="other-projects" className="section other-work-section" aria-labelledby="other-work-title">
    <GameEasterEgg kind="blocks" />
    <AnimatedContent>
    <header className="section-heading carousel-heading"><div><h2 id="other-work-title">{title}</h2><p>{description} Drag to explore.</p></div><div className="carousel-controls"><button type="button" onClick={() => move(-1)} aria-label="Previous projects">←</button><button type="button" onClick={() => move(1)} aria-label="Next projects">→</button></div></header>
    <nav className="project-filter-nav other-filter-nav" aria-label="Filter other projects by type">
      {projectTypes.map((type) => <button type="button" key={type} aria-pressed={activeType === type} onClick={() => setActiveType(type)}>{type}</button>)}
    </nav>
    </AnimatedContent>
    <AnimatedContent delay={0.08}>
    <div ref={track} className={'other-track' + (isDragging ? ' is-dragging' : '') + (activeType === 'All' ? '' : ' is-filtered')} aria-label="Other projects carousel" onPointerDown={startDrag} onPointerMove={dragTrack} onPointerUp={stopDrag} onPointerLeave={stopDrag} onPointerCancel={stopDrag} onClickCapture={protectLinks}>
      {visibleProjects.map((project) => {
        const index = projects.indexOf(project);
        return (
        <Link draggable="false" key={project.id || project.slug} href={'/projects/' + project.slug} className="other-card other-cover-card">
          <GlareHover className="other-card-art" background={project.bgColor || '#121212'}>
            <Image
              draggable="false"
              src={project.coverImageUrl || placeholderCovers[index % placeholderCovers.length]}
              alt={`${project.title} project cover`}
              fill
              sizes="(max-width: 620px) 86vw, (max-width: 980px) 72vw, 34vw"
            />
          </GlareHover>
          <div className="other-card-overlay">
            <small>{String(index + 1).padStart(2, '0')} / {project.tag} · {project.year}</small>
            <strong>{project.title}</strong>
            <p>{project.description}</p>
            <b>{project.tech}</b>
            <i aria-hidden="true">↗</i>
          </div>
        </Link>
        );
      })}
    </div>
    </AnimatedContent>
  </section>;
}
