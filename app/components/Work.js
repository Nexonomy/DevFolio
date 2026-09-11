'use client';

import { useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getBlobDeliveryUrl } from '@/lib/blob';

const contextLabels = {
  PERSONAL: 'Personal project',
  COMPANY: 'Company project',
  ACADEMIC: 'Academic project',
  HACKATHON: 'Hackathon',
};

function projectCategories(project) {
  const values = project.categories?.length ? project.categories : [project.tag];
  return values.map((category) => String(category).trim()).filter(Boolean);
}

export default function Work({ games = [] }) {
  const [activeCategory, setActiveCategory] = useState('All');
  const [isDraggingFilters, setIsDraggingFilters] = useState(false);
  const filterRailRef = useRef(null);
  const filterDrag = useRef({ active:false, moved:false, startX:0, scrollLeft:0 });

  const startFilterDrag = (event) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    const rail = filterRailRef.current;
    if (!rail || rail.scrollWidth <= rail.clientWidth) return;
    filterDrag.current = {
      active:true,
      moved:false,
      startX:event.clientX,
      scrollLeft:rail.scrollLeft,
    };
    setIsDraggingFilters(true);
    rail.setPointerCapture?.(event.pointerId);
  };

  const moveFilterDrag = (event) => {
    const rail = filterRailRef.current;
    if (!rail || !filterDrag.current.active) return;
    const distance = event.clientX - filterDrag.current.startX;
    if (Math.abs(distance) > 4) filterDrag.current.moved = true;
    rail.scrollLeft = filterDrag.current.scrollLeft - distance;
  };

  const endFilterDrag = (event) => {
    const rail = filterRailRef.current;
    if (!filterDrag.current.active) return;
    filterDrag.current.active = false;
    setIsDraggingFilters(false);
    if (rail?.hasPointerCapture?.(event.pointerId)) rail.releasePointerCapture(event.pointerId);
  };

  const scrollFilterRail = (event) => {
    const rail = filterRailRef.current;
    if (!rail || rail.scrollWidth <= rail.clientWidth) return;
    const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
    const next = Math.max(0, Math.min(rail.scrollWidth - rail.clientWidth, rail.scrollLeft + delta));
    if (next !== rail.scrollLeft) {
      event.preventDefault();
      rail.scrollLeft = next;
    }
  };

  const categories = useMemo(() => {
    const unique = new Map();
    games.flatMap(projectCategories).forEach((category) => {
      const key = category.toLocaleLowerCase();
      if (!unique.has(key)) unique.set(key, category);
    });
    return [...unique.values()];
  }, [games]);

  const visibleGames = activeCategory === 'All'
    ? games
    : games.filter((project) => projectCategories(project).some(
      (category) => category.toLocaleLowerCase() === activeCategory.toLocaleLowerCase(),
    ));

  return <section id="work" className="section work-section" aria-labelledby="work-title">
    <div className="section-heading">
      <div><p className="section-label">Game development &amp; design</p><h2 id="work-title" className="section-title">Choose your next adventure.</h2></div>
      <p>Playable ideas and curious experiments I kept pushing until they felt alive.</p>
    </div>

    {games.length > 0 && (
      <div className="game-filter-shell">

        <div
          ref={filterRailRef}
          className={'game-filter-list' + (isDraggingFilters ? ' is-dragging' : '')}
          role="group"
          aria-label="Filter games by category"
          onPointerDown={startFilterDrag}
          onPointerMove={moveFilterDrag}
          onPointerUp={endFilterDrag}
          onPointerCancel={endFilterDrag}
          onWheel={scrollFilterRail}
        >
          {['All', ...categories].map((category) => (
            <button
              key={category}
              type="button"
              className={activeCategory === category ? 'is-active' : ''}
              aria-pressed={activeCategory === category}
              onClick={() => { if (!filterDrag.current.moved) setActiveCategory(category); }}
            >
              <span>{category}</span>
            </button>
          ))}
        </div>
      </div>
    )}

    {games.length === 0 ? <div className="work-empty"><span aria-hidden="true">{'\u2733'}</span><h3>The next adventure is taking shape.</h3><p>Games will appear here when they are ready to share.</p></div> : (
      <>
        <div className="work-grid" key={activeCategory}>
          {visibleGames.map((project, index) => {
            const tags = projectCategories(project);
            return <article key={project.id} className={'project-card project-' + (index + 1) + (index === 0 ? ' project-featured' : '')} style={{ '--project-accent':project.bgColor }}>
              <Link href={'/games/' + project.slug} className="card-thumbnail" style={{ backgroundColor:project.bgColor }} aria-label={'Explore ' + project.title} tabIndex={-1}>
                {project.coverImageUrl ? <Image src={getBlobDeliveryUrl(project.coverImageUrl)} alt={project.title} fill className="card-cover-image" sizes={index === 0 ? '(max-width: 760px) 100vw, 60vw' : '(max-width: 760px) 100vw, 40vw'} /> : <div className="project-art" aria-hidden="true"><span className="art-orbit" /><span className="art-symbol">{project.emoji || '\u2733'}</span><span className="art-caption">{project.tag} / {project.year || 'IN DEVELOPMENT'}</span></div>}
                <span className="card-tag">{index === 0 ? '\u2605 Featured adventure' : 'Adventure ' + (index + 1)}</span>
              </Link>
              <div className="card-body">
                <div className="project-badge-row"><span className="project-context-badge">{contextLabels[project.projectContext] || 'Personal project'}</span><p className="card-index">{project.tag}{project.year ? ' / ' + project.year : ''}</p></div>
                <div className="project-category-row" aria-label="Game categories">{tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
                <h3 className="card-title">{project.title}</h3><p className="card-description">{project.description}</p><p className="card-tech">{project.tech}</p>
                <Link href={'/games/' + project.slug} className="card-button" aria-label={'Enter project: ' + project.title}>Play the story <span aria-hidden="true">{'\u2197'}</span></Link>
              </div>
            </article>;
          })}
        </div>
      </>
    )}
  </section>;
}
