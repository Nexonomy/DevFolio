'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { extractYouTubeId } from '@/lib/youtube';
import { getBlobDeliveryUrl } from '@/lib/blob';

const contextLabels = { PERSONAL: 'Personal project', COMPANY: 'Company project', ACADEMIC: 'Academic project', HACKATHON: 'Hackathon' };

function splitTitle(text) {
  const match = String(text).match(/^([^:]{2,60}):\s+(.+)$/s);
  return match ? [match[1].trim(), match[2].trim()] : [String(text), ''];
}

function SplitLine({ text }) {
  const [title, body] = splitTitle(text);
  return body ? <><strong>{title}</strong> {body}</> : title;
}

export default function GameDetail({ game }) {
  const isGame = game.portfolioSection !== 'OTHER';
  const techItems = (game.tech || '').split(/[·,]/).map((item) => item.trim()).filter(Boolean);
  const contributions = game.contributions || [];
  const team = game.team || [];
  const features = game.features || [];
  const highlights = game.highlights || [];
  const projectNumber = String((game.sortOrder ?? 0) + 1).padStart(2, '0');
  const media = [
    ...(game.videos || []).map((video) => ({ videoId: extractYouTubeId(video.youtubeUrl), title: video.title }))
      .filter((video) => video.videoId)
      .map(({ videoId, title }) => ({ type: 'video', videoId, src: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`, alt: title || `${game.title} video` })),
    ...(game.coverImageUrl ? [{ src: getBlobDeliveryUrl(game.coverImageUrl), alt: `${game.title} cover` }] : []),
    ...(game.screenshots || []).map((shot, index) => ({ src: getBlobDeliveryUrl(shot.url), alt: shot.alt || `${game.title} screenshot ${index + 1}` })),
  ];

  const [active, setActive] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const dialogRef = useRef(null);
  const current = media[active];
  const step = (delta) => setActive((index) => (index + delta + media.length) % media.length);

  useEffect(() => {
    if (lightboxOpen) dialogRef.current?.showModal();
  }, [lightboxOpen]);

  const onLightboxKey = (event) => {
    if (media.length < 2) return;
    if (event.key === 'ArrowRight') { event.preventDefault(); step(1); }
    if (event.key === 'ArrowLeft') { event.preventDefault(); step(-1); }
  };

  const facts = [
    game.role && { label: 'My role', value: game.role, wide: true },
    game.year && { label: 'Year', value: game.year },
    { label: isGame ? 'Genre' : 'Discipline', value: game.tag },
    game.platforms && { label: 'Platforms', value: game.platforms },
    { label: 'Context', value: contextLabels[game.projectContext] || 'Personal project' },
  ].filter(Boolean);

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
          <div className="game-detail-media">
            <div className="game-detail-cover" style={{ background: game.bgColor }}>
              {current?.type !== 'video' && <span className="game-detail-cover-label">Project {projectNumber}</span>}
              {current?.type === 'video' ? (
                <iframe
                  key={current.videoId}
                  className="game-detail-cover-video"
                  src={`https://www.youtube-nocookie.com/embed/${current.videoId}?rel=0`}
                  title={current.alt}
                  allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : current ? (
                <button type="button" className="game-detail-cover-open" onClick={() => setLightboxOpen(true)} aria-label={`View ${current.alt} full screen`}>
                  <Image key={current.src} src={current.src} alt={current.alt} fill className="game-detail-cover-image" priority={active === 0} sizes="(max-width: 900px) 100vw, 640px" />
                  <span className="game-detail-cover-zoom" aria-hidden="true">⤢</span>
                </button>
              ) : (
                <div className="game-detail-placeholder" aria-hidden="true">
                  <span className="game-detail-placeholder-mark">{game.emoji || '✳'}</span>
                  <span>{game.tag}</span>
                </div>
              )}
              {game.year && current?.type !== 'video' && <span className="game-detail-cover-year">{game.year}</span>}
            </div>

            {media.length > 1 && (
              <ul className="game-detail-thumbs" aria-label="Project images">
                {media.map((item, index) => (
                  <li key={item.src}>
                    <button type="button" className={index === active ? 'is-active' : undefined} aria-pressed={index === active} aria-label={`Show ${item.alt}`} onClick={() => setActive(index)}>
                      {item.type === 'video' ? (
                        <>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={item.src} alt="" loading="lazy" />
                          <span className="game-detail-thumb-play" aria-hidden="true">▶</span>
                        </>
                      ) : (
                        <Image src={item.src} alt="" fill sizes="120px" />
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="game-detail-meta">
            <div className="game-detail-badges"><span className="game-detail-tag">{game.tag}</span><span className="project-context-badge">{contextLabels[game.projectContext] || 'Personal project'}</span></div>
            <h1 className="game-detail-title">{game.title}</h1>
            <p className="game-detail-description">{game.description}</p>
            <div className="game-detail-facts">
              {facts.map((fact, index) => (
                <div key={fact.label} className={fact.wide || (index === facts.length - 1 && (facts.length - facts.filter((item) => item.wide).length) % 2 === 1) ? 'is-wide' : undefined}>
                  <small>{fact.label}</small><strong>{fact.value}</strong>
                </div>
              ))}
            </div>
            {techItems.length > 0 && <ul className="game-detail-tech-list" aria-label="Tools and technologies">{techItems.map((item) => <li key={item}>{item}</li>)}</ul>}
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

      {(features.length > 0 || highlights.length > 0) && (
        <section className="game-detail-section">
          <div className="game-case-split">
            {features.length > 0 && (
              <div>
                <p className="game-detail-section-kicker">Features</p>
                <h2 className="game-detail-section-title">Highlights</h2>
                <ul className="game-case-features">{features.map((item) => <li key={item}>{item}</li>)}</ul>
              </div>
            )}
            {highlights.length > 0 && (
              <div>
                <p className="game-detail-section-kicker">Behind the build</p>
                <h2 className="game-detail-section-title">Technical notes</h2>
                <ol className="game-case-notes">
                  {highlights.map((item) => {
                    const [title, body] = splitTitle(item);
                    return <li key={item}>{body ? <><strong>{title}</strong><p>{body}</p></> : <p>{title}</p>}</li>;
                  })}
                </ol>
              </div>
            )}
          </div>
        </section>
      )}

      <footer className="game-detail-footer">
        <p>End of case study</p>
        <Link href={isGame ? '/#portfolio' : '/#other-projects'}><span>Explore more work</span><b aria-hidden="true">↗</b></Link>
      </footer>

      {lightboxOpen && current && (
        <dialog
          ref={dialogRef}
          className="game-lightbox"
          onClose={() => setLightboxOpen(false)}
          onKeyDown={onLightboxKey}
          onClick={(event) => { if (event.target === event.currentTarget) dialogRef.current?.close(); }}
          aria-label={`${game.title} images`}
        >
          <button type="button" className="game-lightbox-close" aria-label="Close" onClick={() => dialogRef.current?.close()}>×</button>
          {current.type === 'video' ? (
            <iframe
              key={current.videoId}
              className="game-lightbox-video"
              src={`https://www.youtube-nocookie.com/embed/${current.videoId}?rel=0`}
              title={current.alt}
              allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={current.src} alt={current.alt} className="game-lightbox-image" />
          )}
          {media.length > 1 && (
            <>
              <button type="button" className="game-lightbox-nav is-prev" aria-label="Previous image" onClick={() => step(-1)}>‹</button>
              <button type="button" className="game-lightbox-nav is-next" aria-label="Next image" onClick={() => step(1)}>›</button>
              <span className="game-lightbox-count">{active + 1} / {media.length}</span>
            </>
          )}
        </dialog>
      )}
    </div>
  );
}
