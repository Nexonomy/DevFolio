'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import AnimatedContent from './reactbits/AnimatedContent';
import GlareHover from './reactbits/GlareHover';
import GameEasterEgg from './easter-eggs/GameEasterEgg';
import FilterRail from './FilterRail';

const placeholderCovers = [
  '/project-placeholders/magic-student.png',
  '/project-placeholders/luggage-character.png',
];

export default function OtherProjects({ projects = [], title = 'Additional Projects', description = 'Selected creative and technical work beyond game development.' }) {
  const track = useRef(null);
  const progressRail = useRef(null);
  const drag = useRef({ active:false, axis:null, startX:0, startY:0, scrollLeft:0, moved:false, lastX:0, lastTime:0, velocity:0, elastic:0 });
  const momentum = useRef(null);
  const elasticFrame = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [activeType, setActiveType] = useState('All');
  const projectTypes = ['All', ...new Set(projects.map((project) => project.tag).filter(Boolean))];
  const visibleProjects = activeType === 'All' ? projects : projects.filter((project) => project.tag === activeType);

  function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function setElastic(value) {
    drag.current.elastic = value;
    track.current?.style.setProperty('--elastic-x', `${value}px`);
  }

  function updateProgress() {
    const element = track.current;
    const rail = progressRail.current;
    if (!element || !rail) return;
    const visibleRatio = Math.min(1, element.clientWidth / Math.max(1, element.scrollWidth));
    const maxScroll = Math.max(0, element.scrollWidth - element.clientWidth);
    const position = maxScroll > 0 ? element.scrollLeft / maxScroll : 0;
    const shift = visibleRatio < 1 ? position * ((1 - visibleRatio) / visibleRatio) * 100 : 0;
    rail.style.setProperty('--thumb-size', `${visibleRatio * 100}%`);
    rail.style.setProperty('--thumb-shift', `${shift}%`);
  }

  function springElasticBack() {
    cancelAnimationFrame(elasticFrame.current);
    if (prefersReducedMotion()) {
      setElastic(0);
      return;
    }
    let position = drag.current.elastic;
    let velocity = 0;
    const settle = () => {
      velocity = (velocity - position * 0.14) * 0.72;
      position += velocity;
      setElastic(position);
      if (Math.abs(position) > 0.15 || Math.abs(velocity) > 0.15) {
        elasticFrame.current = requestAnimationFrame(settle);
      } else {
        setElastic(0);
      }
    };
    elasticFrame.current = requestAnimationFrame(settle);
  }

  useEffect(() => {
    track.current?.scrollTo({ left: 0, behavior: 'smooth' });
    setElastic(0);
    requestAnimationFrame(updateProgress);
  }, [activeType]);

  useEffect(() => {
    const element = track.current;
    if (!element) return undefined;
    const observer = new ResizeObserver(updateProgress);
    observer.observe(element);
    requestAnimationFrame(updateProgress);
    return () => observer.disconnect();
  }, [visibleProjects.length]);

  useEffect(() => () => {
    cancelAnimationFrame(momentum.current);
    cancelAnimationFrame(elasticFrame.current);
  }, []);

  if (!projects.length) return null;
  const animateScroll = (element, target, duration = 820) => {
    cancelAnimationFrame(momentum.current);
    cancelAnimationFrame(elasticFrame.current);
    const maxScroll = Math.max(0, element.scrollWidth - element.clientWidth);
    const clampedTarget = Math.max(0, Math.min(maxScroll, target));
    if (prefersReducedMotion()) {
      element.scrollLeft = clampedTarget;
      updateProgress();
      return;
    }

    element.classList.add('is-gliding');
    element.style.scrollBehavior = 'auto';
    const start = element.scrollLeft;
    const distance = clampedTarget - start;
    const startedAt = performance.now();
    const ease = (progress) => {
      const overshoot = 1.12;
      return 1 + (overshoot + 1) * Math.pow(progress - 1, 3) + overshoot * Math.pow(progress - 1, 2);
    };
    const frame = (now) => {
      const progress = Math.min(1, (now - startedAt) / duration);
      element.scrollLeft = Math.max(0, Math.min(maxScroll, start + distance * ease(progress)));
      updateProgress();
      if (progress < 1) {
        momentum.current = requestAnimationFrame(frame);
      } else {
        element.classList.remove('is-gliding');
        element.style.removeProperty('scroll-behavior');
      }
    };
    momentum.current = requestAnimationFrame(frame);
  };
  const move = (direction) => {
    const element = track.current;
    if (!element) return;
    setIsDragging(false);
    const maxScroll = Math.max(0, element.scrollWidth - element.clientWidth);
    const target = Math.max(0, Math.min(maxScroll, element.scrollLeft + direction * element.clientWidth * 0.72));
    if (Math.abs(target - element.scrollLeft) < 1) {
      setElastic(direction < 0 ? 28 : -28);
      springElasticBack();
      return;
    }
    animateScroll(element, target);
  };
  const startDrag = (event) => {
    cancelAnimationFrame(momentum.current);
    cancelAnimationFrame(elasticFrame.current);
    track.current.classList.remove('is-gliding');
    track.current.style.removeProperty('scroll-behavior');
    setElastic(0);
    drag.current = {
      active:true,
      axis:null,
      startX:event.clientX,
      startY:event.clientY,
      scrollLeft:track.current.scrollLeft,
      moved:false,
      lastX:event.clientX,
      lastTime:performance.now(),
      velocity:0,
      elastic:0,
    };
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };
  const dragTrack = (event) => {
    if (!drag.current.active) return;
    const distanceX = event.clientX - drag.current.startX;
    const distanceY = event.clientY - drag.current.startY;
    if (!drag.current.axis) {
      if (Math.max(Math.abs(distanceX), Math.abs(distanceY)) < 5) return;
      drag.current.axis = Math.abs(distanceX) > Math.abs(distanceY) * 1.08 ? 'x' : 'y';
      if (drag.current.axis === 'y') {
        drag.current.active = false;
        if (event.currentTarget.hasPointerCapture?.(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
        return;
      }
      setIsDragging(true);
    }
    if (drag.current.axis !== 'x') return;
    event.preventDefault();
    const now = performance.now();
    const elapsed = Math.max(1, now - drag.current.lastTime);
    const step = event.clientX - drag.current.lastX;
    if (Math.abs(distanceX) > 5) drag.current.moved = true;
    const instantVelocity = Math.max(-3, Math.min(3, -step / elapsed));
    drag.current.velocity = drag.current.velocity * 0.55 + instantVelocity * 0.45;
    drag.current.lastX = event.clientX;
    drag.current.lastTime = now;
    const element = track.current;
    const maxScroll = Math.max(0, element.scrollWidth - element.clientWidth);
    const intended = drag.current.scrollLeft - distanceX;
    if (intended < 0) {
      element.scrollLeft = 0;
      const stretch = prefersReducedMotion() ? 0 : Math.min(76, Math.pow(-intended, 0.72) * 1.7);
      setElastic(stretch);
    } else if (intended > maxScroll) {
      element.scrollLeft = maxScroll;
      const stretch = prefersReducedMotion() ? 0 : Math.min(76, Math.pow(intended - maxScroll, 0.72) * 1.7);
      setElastic(-stretch);
    } else {
      element.scrollLeft = intended;
      setElastic(0);
    }
    updateProgress();
  };
  const stopDrag = (event) => {
    if (!drag.current.active) return;
    drag.current.active = false;
    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);

    const element = track.current;
    let velocity = drag.current.velocity;
    if (!element) return;
    if (Math.abs(drag.current.elastic) > 0.1) {
      springElasticBack();
      setIsDragging(false);
      return;
    }
    if (prefersReducedMotion() || drag.current.axis !== 'x' || Math.abs(velocity) < 0.08) {
      setIsDragging(false);
      return;
    }

    const glide = () => {
      velocity *= 0.94;
      const maxScroll = Math.max(0, element.scrollWidth - element.clientWidth);
      const next = element.scrollLeft + velocity * 16;
      if (next < 0 || next > maxScroll) {
        element.scrollLeft = next < 0 ? 0 : maxScroll;
        setElastic((next < 0 ? 1 : -1) * Math.min(52, 10 + Math.abs(velocity) * 20));
        updateProgress();
        springElasticBack();
        setIsDragging(false);
        return;
      }
      element.scrollLeft = next;
      updateProgress();
      if (Math.abs(velocity) > 0.025) {
        momentum.current = requestAnimationFrame(glide);
      } else {
        setIsDragging(false);
      }
    };
    momentum.current = requestAnimationFrame(glide);
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
    <FilterRail
      items={projectTypes}
      value={activeType}
      onChange={setActiveType}
      label="Filter other projects by type"
      className="other-filter-nav"
    />
    </AnimatedContent>
    <AnimatedContent delay={0.08}>
    <div ref={track} className={'other-track' + (isDragging ? ' is-dragging' : '') + (activeType === 'All' ? '' : ' is-filtered')} aria-label="Other projects carousel" onScroll={updateProgress} onPointerDown={startDrag} onPointerMove={dragTrack} onPointerUp={stopDrag} onPointerLeave={stopDrag} onPointerCancel={stopDrag} onClickCapture={protectLinks}>
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
    <div ref={progressRail} className="other-carousel-progress" aria-hidden="true"><span /></div>
    </AnimatedContent>
  </section>;
}
