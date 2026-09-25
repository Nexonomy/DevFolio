function getAudioContext() {
  if (typeof window === 'undefined') return null;
  if (window.localStorage.getItem('retro-audio-muted') !== 'false') return null;
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  return AudioContext ? new AudioContext() : null;
}

export function setRetroAudioMuted(muted) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem('retro-audio-muted', String(muted));
  window.dispatchEvent(new CustomEvent('retro:audio-setting', { detail: { muted } }));
}

export function playRetroSequence(notes, { volume = 0.035, wave = 'square' } = {}) {
  const context = getAudioContext();
  if (!context) return;

  const start = context.currentTime;
  notes.forEach(({ frequency, duration = 0.08, offset = 0 }, index) => {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const noteStart = start + offset + (index * 0.075);
    const noteEnd = noteStart + duration;

    oscillator.type = wave;
    oscillator.frequency.setValueAtTime(frequency, noteStart);
    gain.gain.setValueAtTime(0.0001, noteStart);
    gain.gain.exponentialRampToValueAtTime(volume, noteStart + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, noteEnd);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(noteStart);
    oscillator.stop(noteEnd + 0.02);
  });

  const totalDuration = Math.max(...notes.map((note, index) => (note.offset || 0) + (index * 0.075) + (note.duration || 0.08)), 0.2);
  window.setTimeout(() => context.close().catch(() => {}), (totalDuration + 0.25) * 1000);
}

export function playOneUp() {
  playRetroSequence([
    { frequency: 523 }, { frequency: 659 }, { frequency: 784 }, { frequency: 1047, duration: 0.16 },
  ]);
}

export function playItemReveal() {
  playRetroSequence([
    { frequency: 659 }, { frequency: 784 }, { frequency: 988 }, { frequency: 1319, duration: 0.18 },
  ], { volume: 0.028, wave: 'triangle' });
}

export function playAlertTone() {
  playRetroSequence([
    { frequency: 880, duration: 0.07 }, { frequency: 1175, duration: 0.12 },
  ], { volume: 0.025 });
}

export function playWorldShift() {
  playRetroSequence([
    { frequency: 330, duration: 0.05 }, { frequency: 494, duration: 0.07 },
  ], { volume: 0.018, wave: 'triangle' });
}
