'use client';

import { useEffect, useRef, useState } from 'react';

export default function FilterRail({ items, value, onChange, label, className = '' }) {
  const shellRef = useRef(null);
  const railRef = useRef(null);
  const [isSectionActive, setIsSectionActive] = useState(false);
  const [overflow, setOverflow] = useState({ left: false, right: false });

  useEffect(() => {
    const shell = shellRef.current;
    const section = shell?.closest('section');
    if (!section) return undefined;

    const observer = new IntersectionObserver(([entry]) => {
      setIsSectionActive(entry.isIntersecting);
    }, { rootMargin: '-30% 0px -30% 0px', threshold: 0 });

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return undefined;

    const updateOverflow = () => {
      const maxScroll = Math.max(0, rail.scrollWidth - rail.clientWidth);
      setOverflow({
        left: rail.scrollLeft > 2,
        right: rail.scrollLeft < maxScroll - 2,
      });
    };

    updateOverflow();
    rail.addEventListener('scroll', updateOverflow, { passive: true });
    const resizeObserver = new ResizeObserver(updateOverflow);
    resizeObserver.observe(rail);

    return () => {
      rail.removeEventListener('scroll', updateOverflow);
      resizeObserver.disconnect();
    };
  }, [items]);

  // Desktop/mouse support: wheel, click-and-drag and arrow buttons (touch keeps native swiping).
  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return undefined;

    const drag = { active: false, startX: 0, startScroll: 0, moved: false };

    const onWheel = (event) => {
      const maxScroll = rail.scrollWidth - rail.clientWidth;
      if (maxScroll <= 0) return;
      const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
      const canMove = delta < 0 ? rail.scrollLeft > 0 : rail.scrollLeft < maxScroll;
      if (!delta || !canMove) return;
      event.preventDefault();
      rail.scrollLeft += delta;
    };

    const onPointerDown = (event) => {
      if (event.pointerType !== 'mouse' || event.button !== 0) return;
      drag.active = true;
      drag.moved = false;
      drag.startX = event.clientX;
      drag.startScroll = rail.scrollLeft;
    };

    const onPointerMove = (event) => {
      if (!drag.active) return;
      const distance = event.clientX - drag.startX;
      if (!drag.moved && Math.abs(distance) < 5) return;
      if (!drag.moved) {
        drag.moved = true;
        rail.classList.add('is-dragging');
      }
      rail.scrollLeft = drag.startScroll - distance;
    };

    const endDrag = () => {
      if (!drag.active) return;
      drag.active = false;
      rail.classList.remove('is-dragging');
    };

    // Swallow the click that ends a drag so it does not change the selected filter.
    const onClickCapture = (event) => {
      if (drag.moved) {
        event.preventDefault();
        event.stopPropagation();
        drag.moved = false;
      }
    };

    rail.addEventListener('wheel', onWheel, { passive: false });
    rail.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', endDrag);
    window.addEventListener('pointercancel', endDrag);
    rail.addEventListener('click', onClickCapture, true);

    return () => {
      rail.removeEventListener('wheel', onWheel);
      rail.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', endDrag);
      window.removeEventListener('pointercancel', endDrag);
      rail.removeEventListener('click', onClickCapture, true);
    };
  }, [items]);

  const scrollRail = (direction) => {
    const rail = railRef.current;
    if (!rail) return;
    rail.scrollBy({ left: direction * rail.clientWidth * 0.7, behavior: 'smooth' });
  };

  const selectItem = (item, event) => {
    onChange(item);
    event.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  };

  const shellClasses = [
    'filter-rail-shell',
    className,
    isSectionActive ? 'is-section-active' : '',
    overflow.left ? 'has-left-overflow' : '',
    overflow.right ? 'has-right-overflow' : '',
  ].filter(Boolean).join(' ');

  return (
    <div ref={shellRef} className={shellClasses}>
      <button type="button" className="filter-rail-arrow is-prev" aria-label={`Scroll ${label} left`} onClick={() => scrollRail(-1)} tabIndex={-1}>←</button>
      <nav ref={railRef} className="project-filter-nav" aria-label={label}>
        {items.map((item) => (
          <button
            type="button"
            key={item}
            aria-pressed={value === item}
            onClick={(event) => selectItem(item, event)}
          >
            {item}
          </button>
        ))}
      </nav>
      <button type="button" className="filter-rail-arrow is-next" aria-label={`Scroll ${label} right`} onClick={() => scrollRail(1)} tabIndex={-1}>→</button>
      <span className="filter-rail-cue" aria-hidden="true">Swipe <b>↔</b></span>
    </div>
  );
}
