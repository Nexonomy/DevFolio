'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

const DEFAULT_SRC = process.env.NEXT_PUBLIC_BGM_URL || '/bgm/ambient.mp3';
const DEFAULT_VOLUME = 0.18;
const FADE_MS = 900;
const STORAGE_KEY = 'devfolio-bgm-on';

function readStoredPreference() {
  if (typeof window === 'undefined') return false;
  try {
    return window.localStorage.getItem(STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

function fade(audio, from, to, duration) {
  if (!audio) return;
  const start = performance.now();
  audio.volume = from;
  const step = (now) => {
    const t = Math.min(1, (now - start) / duration);
    audio.volume = from + (to - from) * t;
    if (t < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

export default function BackgroundMusic({ src = DEFAULT_SRC, volume = DEFAULT_VOLUME }) {
  const audioRef = useRef(null);
  const [available, setAvailable] = useState(true);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const audio = new Audio(src);
    audio.loop = true;
    audio.preload = 'none';
    audio.volume = 0;
    audio.crossOrigin = 'anonymous';
    audioRef.current = audio;

    const onError = () => setAvailable(false);
    audio.addEventListener('error', onError);

    // If the user previously turned it on, auto-resume on next interaction so
    // the browser lets us play. We never auto-play without a prior user gesture.
    const wantsOn = readStoredPreference();
    const resumeOnGesture = () => {
      if (!wantsOn) return;
      void audio
        .play()
        .then(() => {
          setPlaying(true);
          fade(audio, 0, volume, FADE_MS);
        })
        .catch(() => {});
      cleanupListeners();
    };
    const cleanupListeners = () => {
      window.removeEventListener('pointerdown', resumeOnGesture);
      window.removeEventListener('keydown', resumeOnGesture);
    };
    if (wantsOn) {
      window.addEventListener('pointerdown', resumeOnGesture, { once: true, passive: true });
      window.addEventListener('keydown', resumeOnGesture, { once: true });
    }

    const handleVisibility = () => {
      if (!audioRef.current || audioRef.current.paused) return;
      if (document.hidden) {
        audioRef.current.pause();
      } else if (readStoredPreference()) {
        void audioRef.current.play().catch(() => {});
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      cleanupListeners();
      document.removeEventListener('visibilitychange', handleVisibility);
      audio.removeEventListener('error', onError);
      audio.pause();
      audioRef.current = null;
    };
  }, [src, volume]);

  const toggle = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !available) return;
    if (playing) {
      fade(audio, audio.volume, 0, FADE_MS);
      window.setTimeout(() => {
        if (!audioRef.current) return;
        audioRef.current.pause();
      }, FADE_MS);
      setPlaying(false);
      try { window.localStorage.setItem(STORAGE_KEY, 'false'); } catch {}
      return;
    }
    audio
      .play()
      .then(() => {
        fade(audio, 0, volume, FADE_MS);
        setPlaying(true);
        try { window.localStorage.setItem(STORAGE_KEY, 'true'); } catch {}
      })
      .catch(() => {
        // Browser blocked playback; ignore quietly.
      });
  }, [available, playing, volume]);

  if (!available) return null;

  return (
    <button
      type="button"
      className="retro-audio-toggle retro-bgm-toggle"
      onClick={toggle}
      aria-pressed={playing}
      aria-label={playing ? 'Pause background music' : 'Play background music'}
      title={playing ? 'Pause background music' : 'Play background music'}
    >
      <span aria-hidden="true">{playing ? '♫' : '♪'}</span>
      {playing ? 'Music on' : 'Music off'}
    </button>
  );
}
