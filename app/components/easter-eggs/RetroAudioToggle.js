'use client';

import { useSyncExternalStore } from 'react';
import { playWorldShift, setRetroAudioMuted } from './retroAudio';

const defaultEnabled = process.env.NEXT_PUBLIC_RETRO_EASTER_EGGS !== 'false';

function subscribeToAudioSetting(onChange) {
  window.addEventListener('retro:audio-setting', onChange);
  window.addEventListener('storage', onChange);
  return () => {
    window.removeEventListener('retro:audio-setting', onChange);
    window.removeEventListener('storage', onChange);
  };
}

const getAudioSetting = () => window.localStorage.getItem('retro-audio-muted') !== 'false';
const getServerAudioSetting = () => true;

export default function RetroAudioToggle({ enabled = defaultEnabled }) {
  const muted = useSyncExternalStore(subscribeToAudioSetting, getAudioSetting, getServerAudioSetting);

  if (!enabled) return null;

  const toggle = () => {
    const nextMuted = !muted;
    setRetroAudioMuted(nextMuted);
    if (!nextMuted) window.setTimeout(playWorldShift, 0);
  };

  return <button type="button" className="retro-audio-toggle" aria-pressed={!muted} onClick={toggle}><span aria-hidden="true">{muted ? '×' : '♪'}</span>{muted ? 'SFX off' : 'SFX on'}</button>;
}
