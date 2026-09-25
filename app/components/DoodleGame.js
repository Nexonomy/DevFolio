'use client';

import { useState } from 'react';

const spots = [[16, 44], [72, 18], [42, 70], [82, 68], [22, 16]];

export default function DoodleGame() {
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const hit = () => {
    if (score >= 3) { setScore(0); setRound(0); return; }
    setScore((value) => value + 1);
    setRound((value) => (value + 1) % spots.length);
  };
  const [left, top] = spots[round];
  return <div className="doodle-game"><div className="doodle-game-copy"><span>Tiny break</span><small>{score >= 3 ? 'nice. play again?' : 'catch the spark · ' + score + '/3'}</small></div><div className="doodle-board" aria-label="Tiny catch the spark game"><i className="doodle-line one" /><i className="doodle-line two" /><button type="button" onClick={hit} style={{ left: left + '%', top: top + '%' }} aria-label={score >= 3 ? 'Play again' : 'Catch the spark'}>{score >= 3 ? '↻' : '✦'}</button></div></div>;
}
