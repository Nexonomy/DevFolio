'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { extractYouTubeId } from '@/lib/youtube';
import { getBlobDeliveryUrl } from '@/lib/blob';

export default function GameDetail({ game }) {
  const [lightboxUrl, setLightboxUrl] = useState(null);

  return (
    <div className="game-detail-page">
      <header className="game-detail-hero">
        <Link href="/#work" className="game-detail-back">
          ← Back to Quest Log
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
              <span className="game-detail-emoji">{game.emoji}</span>
            )}
          </div>

          <div className="game-detail-meta">
            <span className="game-detail-tag">{game.tag}</span>
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
        <div className="game-lightbox" onClick={() => setLightboxUrl(null)} role="presentation">
          <button type="button" className="game-lightbox-close" onClick={() => setLightboxUrl(null)}>
            ×
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={lightboxUrl} alt="" className="game-lightbox-image" onClick={(event) => event.stopPropagation()} />
        </div>
      )}
    </div>
  );
}
