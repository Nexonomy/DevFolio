'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { extractYouTubeId } from '@/lib/youtube';
import { getBlobDeliveryUrl } from '@/lib/blob';

function splitTitle(text) {
  const match = String(text).match(/^([^:]{2,60}):\s+(.+)$/s);
  return match ? [match[1].trim(), match[2].trim()] : [String(text), ''];
}

function SplitLine({ text }) {
  const [title, body] = splitTitle(text);
  return body ? <><strong>{title}</strong> {body}</> : title;
}

export default function GameDetail({ game }) {
  const contextLabels = { PERSONAL:'Personal project', COMPANY:'Company project', ACADEMIC:'Academic project', HACKATHON:'Hackathon' };
  const [lightboxUrl, setLightboxUrl] = useState(null);
  const dialogRef = useRef(null);
  const screenshotTrackRef = useRef(null);
  const galleryAnimationRef = useRef(null);
  const isGame = game.portfolioSection !== 'OTHER';
  const techItems = (game.tech || '').split(/[·,]/).map((item) => item.trim()).filter(Boolean);
  const contributions = game.contributions || [];
  const team = game.team || [];
  const features = game.features || [];
  const highlights = game.highlights || [];
  const projectNumber = String((game.sortOrder ?? 0) + 1).padStart(2, '0');
  useEffect(() => {
    if (lightboxUrl) dialogRef.current?.showModal();
  }, [lightboxUrl]);

  useEffect(() => () => cancelAnimationFrame(galleryAnimationRef.current), []);

  const moveGallery = (direction) => {
    const element = screenshotTrackRef.current;
    const slide = element?.querySelector('.game-detail-screenshot');
    if (!element || !slide) return;
    cancelAnimationFrame(galleryAnimationRef.current);
    element.classList.add('is-gliding');
    element.style.scrollBehavior = 'auto';
    const start = element.scrollLeft;
    const distance = direction * (slide.getBoundingClientRect().width + 16);
    const startedAt = performance.now();
    const duration = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 720;
    const frame = (now) => {
      const progress = duration === 0 ? 1 : Math.min(1, (now - startedAt) / duration);
      element.scrollLeft = start + distance * (1 - Math.pow(1 - progress, 4));
      if (progress < 1) {
        galleryAnimationRef.current = requestAnimationFrame(frame);
      } else {
        element.classList.remove('is-gliding');
        element.style.removeProperty('scroll-behavior');
      }
    };
    galleryAnimationRef.current = requestAnimationFrame(frame);
  };

  return (
    <div className="game-detail-page">
      <nav className="game-detail-topbar" aria-label="Project navigation">
        <Link href={isGame ? '/#portfolio' : '/#other-projects'} className="game-detail-back">
          <span aria-hidden="true">←</span> All projects
        </Link>
        <Link href="/" className="game-detail-brand" aria-label="Ahsan Tariq home">AT<span>.</span></Link>
        <span className="game-detail-index">{projectNumber} / Selected work</span>
      </nav>

      <header className="game-detail-hero">
        <div className="game-detail-hero-content">
          <div className="game-detail-cover" style={{ background: game.bgColor }}>
            <span className="game-detail-cover-label">Project {projectNumber}</span>
            {game.coverImageUrl ? (
              <Image
                src={getBlobDeliveryUrl(game.coverImageUrl)}
                alt={game.title}
                fill
                className="game-detail-cover-image"
                priority
                sizes="(max-width: 680px) 100vw, 480px"
              />
            ) : (
              <div className="game-detail-placeholder" aria-hidden="true">
                <span className="game-detail-placeholder-mark">{game.emoji || '✳'}</span>
                <span>{game.tag}</span>
              </div>
            )}
            <span className="game-detail-cover-year">{game.year}</span>
          </div>

          <div className="game-detail-meta">
            <p className="game-detail-eyebrow">{isGame ? 'Playable case study' : 'Creative case study'}</p>
            <div className="game-detail-badges"><span className="game-detail-tag">{game.tag}</span><span className="project-context-badge">{contextLabels[game.projectContext] || 'Personal project'}</span></div>
            <h1 className="game-detail-title">{game.title}</h1>
            <p className="game-detail-description">{game.description}</p>
            <div className="game-detail-facts">
              {game.role && <div className="is-wide"><small>My role</small><strong>{game.role}</strong></div>}
              {game.year && <div><small>Year</small><strong>{game.year}</strong></div>}
              <div><small>{isGame ? 'Genre' : 'Discipline'}</small><strong>{game.tag}</strong></div>
              {game.platforms && <div><small>Platforms</small><strong>{game.platforms}</strong></div>}
              <div><small>Context</small><strong>{contextLabels[game.projectContext] || 'Personal project'}</strong></div>
            </div>
            {game.liveUrl && <a className="game-detail-live" href={game.liveUrl} target="_blank" rel="noreferrer">View live project <b aria-hidden="true">↗</b></a>}
          </div>
        </div>
      </header>

      {(game.contribution || contributions.length > 0 || team.length > 0 || game.recognition) && (
        <section className="game-detail-section">
          <p className="game-detail-section-kicker">Role &amp; contribution</p>
          <h2 className="game-detail-section-title">What I built</h2>
          <div className="game-case-layout">
            <div className="game-case-main">
              {game.contribution && <p className="game-case-lead">{game.contribution}</p>}
              {contributions.length > 0 && (
                <ul className="game-case-list">
                  {contributions.map((item) => <li key={item}><SplitLine text={item} /></li>)}
                </ul>
              )}
            </div>
            {(team.length > 0 || game.recognition) && (
              <aside className="game-case-aside">
                {game.recognition && (
                  <div className="game-case-recognition">
                    <span><b aria-hidden="true">★</b> Recognition</span>
                    <p>{game.recognition}</p>
                  </div>
                )}
                {team.length > 0 && (
                  <div className="game-case-team">
                    <span>Team</span>
                    <ul>{team.map((member) => <li key={member}>{member}</li>)}</ul>
                  </div>
                )}
              </aside>
            )}
          </div>
        </section>
      )}

      {(techItems.length > 0 || features.length > 0) && (
        <section className="game-detail-section">
          <div className="game-case-split">
            {features.length > 0 && (
              <div>
                <p className="game-detail-section-kicker">Features</p>
                <h2 className="game-detail-section-title">Highlights</h2>
                <ul className="game-case-features">{features.map((item) => <li key={item}>{item}</li>)}</ul>
              </div>
            )}
            {techItems.length > 0 && (
              <div>
                <p className="game-detail-section-kicker">Tools</p>
                <h2 className="game-detail-section-title">Tech stack</h2>
                <ul className="game-detail-tech-list game-case-tech" aria-label="Tools and technologies">{techItems.map((item) => <li key={item}>{item}</li>)}</ul>
              </div>
            )}
          </div>
        </section>
      )}

      {highlights.length > 0 && (
        <section className="game-detail-section">
          <p className="game-detail-section-kicker">Behind the build</p>
          <h2 className="game-detail-section-title">Technical highlights</h2>
          <div className="game-design-grid">
            {highlights.map((item, index) => {
              const [title, body] = splitTitle(item);
              return (
                <article key={item}>
                  <span>{String(index + 1).padStart(2, '0')}{body ? ` / ${title}` : ''}</span>
                  <p>{body || title}</p>
                </article>
              );
            })}
          </div>
        </section>
      )}

      {(game.screenshots || []).length > 0 && (
        <section className="game-detail-section">
          <div className="game-detail-section-heading">
            <div><p className="game-detail-section-kicker">Project gallery</p><h2 className="game-detail-section-title">Screenshots</h2></div>
            {game.screenshots.length > 1 && <div className="game-detail-gallery-controls"><button type="button" onClick={() => moveGallery(-1)} aria-label="Previous screenshot">←</button><button type="button" onClick={() => moveGallery(1)} aria-label="Next screenshot">→</button></div>}
          </div>
          <div ref={screenshotTrackRef} className="game-detail-screenshots">
            {game.screenshots.map((screenshot) => {
              const imageUrl = getBlobDeliveryUrl(screenshot.url);

              return (
              <button
                key={screenshot.id}
                type="button"
                className="game-detail-screenshot"
                aria-label={`Enlarge ${screenshot.alt || `${game.title} screenshot`}`}
                onClick={() => setLightboxUrl(imageUrl)}
              >
                <Image
                  src={imageUrl}
                  alt={screenshot.alt || `${game.title} screenshot`}
                  fill
                  className="game-detail-screenshot-image"
                  sizes="(max-width: 680px) 100vw, 320px"
                />
              </button>
              );
            })}
          </div>
        </section>
      )}

      {(game.videos || []).length > 0 && (
        <section className="game-detail-section">
          <p className="game-detail-section-kicker">In motion</p>
          <h2 className="game-detail-section-title">Videos</h2>
          <div className="game-detail-videos">
            {game.videos.map((video) => {
              const videoId = extractYouTubeId(video.youtubeUrl);
              if (!videoId) return null;

              return (
                <div key={video.id} className="game-detail-video">
                  {video.title && <h3 className="game-detail-video-title">{video.title}</h3>}
                  <div className="game-detail-video-embed">
                    <iframe
                      src={`https://www.youtube.com/embed/${videoId}`}
                      title={video.title || `${game.title} video`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <footer className="game-detail-footer">
        <p>End of case study</p>
        <Link href={isGame ? '/#portfolio' : '/#other-projects'}><span>Explore more work</span><b aria-hidden="true">↗</b></Link>
      </footer>

      {lightboxUrl && (
        <dialog ref={dialogRef} className="game-lightbox" onClose={() => setLightboxUrl(null)} aria-label="Project screenshot">
          <button type="button" className="game-lightbox-close" aria-label="Close screenshot" onClick={() => dialogRef.current?.close()}>
            ×
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={lightboxUrl} alt={`${game.title} enlarged screenshot`} className="game-lightbox-image" />
        </dialog>
      )}
    </div>
  );
}
