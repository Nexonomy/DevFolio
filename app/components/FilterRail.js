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
      <span className="filter-rail-cue" aria-hidden="true">Swipe <b>↔</b></span>
    </div>
  );
}
