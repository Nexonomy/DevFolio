'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { animate, stagger } from 'animejs';
import { getBlobDeliveryUrl } from '@/lib/blob';

export default function Work({ games = [] }) {
  const sectionRef = useRef(null);
  const cardsRef = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animate('.project-card', {
              opacity: [0, 1],
              translateY: [40, 0],
              delay: stagger(120),
              easing: 'outBack',
              duration: 800,
            });
            observer.disconnect();
          }
        });
      },
      { threshold: 0.15 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, [games.length]);

  const handleCardHover = (index) => {
    const coinEl = cardsRef.current[index]?.querySelector('.coin-pop');
    if (coinEl) {
      animate(coinEl, {
        opacity: [0, 1, 0],
        translateY: [0, -42],
        duration: 900,
        easing: 'outCubic',
      });
    }
  };

  return (
    <section id="work" className="section work-section" ref={sectionRef}>
      <p className="section-label">★ QUEST LOG ★</p>
      <h2 className="section-title">MY GAMES</h2>

      {games.length === 0 ? (
        <p className="work-empty">New adventures are being forged. Check back soon!</p>
      ) : (
        <div className="work-grid">
          {games.map((project, i) => (
            <article
              key={project.id}
              className="project-card"
              ref={(el) => {
                cardsRef.current[i] = el;
              }}
              onMouseEnter={() => handleCardHover(i)}
            >
              <div className="coin-pop">+100 ☆</div>
              <div className="card-thumbnail" style={{ background: project.bgColor }}>
                {project.coverImageUrl ? (
                  <Image
                    src={getBlobDeliveryUrl(project.coverImageUrl)}
                    alt={project.title}
                    fill
                    className="card-cover-image"
                    sizes="(max-width: 680px) 100vw, 280px"
                  />
                ) : (
                  <span>{project.emoji}</span>
                )}
                <span className="card-tag">{project.tag}</span>
              </div>
              <div className="card-body">
                <h3 className="card-title">{project.title}</h3>
                <p className="card-description">{project.description}</p>
                <p className="card-tech">{project.tech}</p>
                <Link href={`/games/${project.slug}`} className="card-button">
                  ▶ VIEW
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
