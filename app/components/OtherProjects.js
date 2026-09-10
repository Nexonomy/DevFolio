'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getBlobDeliveryUrl } from '@/lib/blob';
import { animate } from 'animejs';

const contextLabels = { PERSONAL: 'Personal', COMPANY: 'Company', ACADEMIC: 'Academic', HACKATHON: 'Hackathon' };
const clamp = (value, minimum, maximum) => Math.min(maximum, Math.max(minimum, value));

export default function OtherProjects({ projects = [] }) {
  const track = useRef(null);
  const drag = useRef({ active: false, startX: 0, scrollLeft: 0, moved: false });
  const motion = useRef({ frame: 0, timer: 0, target: 0, animation: null });

  const stopMotion = () => {
    if (motion.current.frame) cancelAnimationFrame(motion.current.frame);
    if (motion.current.timer) clearTimeout(motion.current.timer);
    if (motion.current.animation) motion.current.animation.pause();
    motion.current.frame = 0;
    motion.current.timer = 0;
    motion.current.animation = null;
  };

  useEffect(() => () => stopMotion(), []);

  const cardStep = () => {
    const card = track.current?.querySelector('.other-work-card');
    if (!card) return 0;
    return card.getBoundingClientRect().width + 20;
  };

  const move = (direction) => {
    const element = track.current;
    const step = cardStep();
    if (!element || !step) return;

    stopMotion();
    const maximum = element.scrollWidth - element.clientWidth;
    const target = clamp(element.scrollLeft + direction * step, 0, maximum);
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      element.scrollLeft = target;
      return;
    }

    element.classList.add('gliding');
    motion.current.animation = animate(element, {
      scrollLeft: target,
      duration: 720,
      ease: 'out(4)',
      onComplete: () => {
        element.classList.remove('gliding');
        motion.current.animation = null;
      },
    });
  };

  const handleWheel = (event) => {
    const element = track.current;
    if (!element || Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
    event.preventDefault();

    const maximum = element.scrollWidth - element.clientWidth;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      element.scrollLeft = clamp(element.scrollLeft + event.deltaY, 0, maximum);
      return;
    }

    if (motion.current.animation) {
      motion.current.animation.pause();
      motion.current.animation = null;
    }

    element.classList.add('gliding');
    const startingPoint = motion.current.frame ? motion.current.target : element.scrollLeft;
    motion.current.target = clamp(startingPoint + event.deltaY * 1.25, 0, maximum);

    const glide = () => {
      const difference = motion.current.target - element.scrollLeft;
      element.scrollLeft += difference * 0.14;

      if (Math.abs(difference) < 0.45) {
        element.scrollLeft = motion.current.target;
        motion.current.frame = 0;
        element.classList.remove('gliding');
        return;
      }
      motion.current.frame = requestAnimationFrame(glide);
    };

    if (!motion.current.frame) motion.current.frame = requestAnimationFrame(glide);

    clearTimeout(motion.current.timer);
    motion.current.timer = window.setTimeout(() => {
      const step = cardStep();
      if (step) motion.current.target = clamp(Math.round(motion.current.target / step) * step, 0, maximum);
      motion.current.timer = 0;
    }, 130);
  };

  const beginDrag = (event) => {
    if (event.button !== 0 || !track.current) return;
    stopMotion();
    drag.current = { active: true, startX: event.clientX, scrollLeft: track.current.scrollLeft, moved: false };
    track.current.setPointerCapture(event.pointerId);
    track.current.classList.add('dragging');
  };

  const dragTrack = (event) => {
    if (!drag.current.active || !track.current) return;
    const distance = event.clientX - drag.current.startX;
    if (Math.abs(distance) > 5) drag.current.moved = true;
    track.current.scrollLeft = drag.current.scrollLeft - distance;
  };

  const endDrag = (event) => {
    const element = track.current;
    if (!element) return;
    if (element.hasPointerCapture(event.pointerId)) element.releasePointerCapture(event.pointerId);
    drag.current.active = false;
    element.classList.remove('dragging');

    const step = cardStep();
    if (!step || !drag.current.moved) return;
    const maximum = element.scrollWidth - element.clientWidth;
    const target = clamp(Math.round(element.scrollLeft / step) * step, 0, maximum);
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      element.scrollLeft = target;
      return;
    }

    element.classList.add('gliding');
    motion.current.animation = animate(element, {
      scrollLeft: target,
      duration: 620,
      ease: 'out(4)',
      onComplete: () => {
        element.classList.remove('gliding');
        motion.current.animation = null;
      },
    });
  };

  const protectLinksAfterDrag = (event) => {
    if (!drag.current.moved) return;
    event.preventDefault();
    event.stopPropagation();
    drag.current.moved = false;
  };

  return (
    <section id="other-projects" className="section other-work-section" aria-labelledby="other-work-title">
      <header className="other-work-header">
        <div><p className="section-label">Side quests & experiments</p><h2 id="other-work-title" className="section-title">Other things I make.</h2></div>
        <div className="other-work-actions">
          <p className="other-work-count"><strong>{String(projects.length).padStart(2, '0')}</strong><span>projects beyond games</span></p>
          <div className="other-work-buttons"><button type="button" onClick={() => move(-1)} aria-label="Previous projects">←</button><button type="button" onClick={() => move(1)} aria-label="Next projects">→</button></div>
        </div>
      </header>

      {projects.length === 0 ? (
        <div className="other-projects-empty"><span aria-hidden="true">✦</span><div><h3>Another shelf is waiting.</h3><p>Non-game projects will appear here when they are ready to share.</p></div></div>
      ) : (
        <div ref={track} className="other-work-track" aria-label="Other work projects" onWheel={handleWheel} onPointerDown={beginDrag} onPointerMove={dragTrack} onPointerUp={endDrag} onPointerCancel={endDrag} onClickCapture={protectLinksAfterDrag}>
          {projects.map((project, index) => (
            <article key={project.id} className="other-work-card" style={{ '--project-accent': project.bgColor }}>
              <Link href={'/projects/' + project.slug} className="other-work-visual" aria-label={'Explore ' + project.title}>
                {project.coverImageUrl ? <Image src={getBlobDeliveryUrl(project.coverImageUrl)} alt={project.title} fill className="card-cover-image" sizes="(max-width: 760px) 82vw, 340px" /> : <div className="other-project-art" aria-hidden="true"><span className="other-project-number">{String(index + 1).padStart(2, '0')}</span><span className="other-project-symbol">{project.emoji || '✦'}</span><i /></div>}
              </Link>
              <div className="other-work-copy">
                <div className="project-badge-row"><span className="project-context-badge">{contextLabels[project.projectContext] || 'Personal'}</span><span>{project.tag}{project.year ? ' · ' + project.year : ''}</span></div>
                <h3>{project.title}</h3><p>{project.description}</p><p className="other-project-tech">{project.tech}</p>
                <Link href={'/projects/' + project.slug} className="card-button">Open project <span aria-hidden="true">↗</span></Link>
              </div>
            </article>
          ))}
          <div className="other-work-end" aria-hidden="true"><span>More side<br />quests soon</span><i>✦</i></div>
        </div>
      )}
    </section>
  );
}
