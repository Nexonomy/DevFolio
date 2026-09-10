'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { extractYouTubeId } from '@/lib/youtube';
import { getBlobDeliveryUrl } from '@/lib/blob';

export default function GameDetail({ game }) {
  const contextLabels = { PERSONAL:'Personal project', COMPANY:'Company project', ACADEMIC:'Academic project', HACKATHON:'Hackathon' };
  const [lightboxUrl, setLightboxUrl] = useState(null);
  const dialogRef = useRef(null);
  useEffect(() => {
    if (lightboxUrl) dialogRef.current?.showModal();
  }, [lightboxUrl]);

  return (
    <div className="game-detail-page">
      <header className="game-detail-hero">
        <Link href={game.portfolioSection === 'OTHER' ? '/#other-projects' : '/#work'} className="game-detail-back">
          ← Back to selected work
        </Link>

        <div className="game-detail-hero-content">
          <div className="game-detail-cover" style={{ background: game.bgColor }}>
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
              <div className="project-art" aria-hidden="true"><span className="art-orbit" /><span className="art-symbol">{game.emoji || '✳'}</span><span className="art-caption">{game.tag} / {game.year}</span></div>
            )}
          </div>

          <div className="game-detail-meta">
            <div className="game-detail-badges"><span className="game-detail-tag">{game.tag}</span><span className="project-context-badge">{contextLabels[game.projectContext] || 'Personal project'}</span></div>
            <h1 className="game-detail-title">{game.title}</h1>
            {game.year && <p className="game-detail-year">{game.year}</p>}
            <p className="game-detail-tech">{game.tech}</p>
            <p className="game-detail-description">{game.description}</p>
          </div>
        </div>
      </header>

      {game.screenshots.length > 0 && (
        <section className="game-detail-section">
          <h2 className="game-detail-section-title">Screenshots</h2>
          <div className="game-detail-screenshots">
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

      {game.videos.length > 0 && (
        <section className="game-detail-section">
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
