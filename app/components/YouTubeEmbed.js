'use client';

import { useState } from 'react';

// The YouTube player pulls megabytes of script and holds the load event open, so the
// poster and play button stand in for it until someone actually wants to watch.
const origins = ['https://www.youtube-nocookie.com', 'https://i.ytimg.com', 'https://www.google.com'];
let warmed = false;

function warmConnections() {
  if (warmed || typeof document === 'undefined') return;
  warmed = true;
  for (const href of origins) {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = href;
    document.head.appendChild(link);
  }
}

export default function YouTubeEmbed({ videoId, title, className, priority = false }) {
  const [playing, setPlaying] = useState(false);
  const [poster, setPoster] = useState(`https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`);

  if (playing) {
    return (
      <iframe
        className={className}
        src={`https://www.youtube-nocookie.com/embed/${videoId}?rel=0&autoplay=1`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    );
  }

  return (
    <button
      type="button"
      className={`${className} youtube-facade`}
      onPointerEnter={warmConnections}
      onFocus={warmConnections}
      onClick={() => setPlaying(true)}
      aria-label={`Play ${title}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={poster}
        alt=""
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
        decoding="async"
        onError={() => setPoster(`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`)}
      />
      <span className="youtube-facade-play" aria-hidden="true" />
    </button>
  );
}
