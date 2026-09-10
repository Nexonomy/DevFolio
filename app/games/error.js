'use client';
import Link from 'next/link';
export default function GameError({ reset }) {
  return <main className="section"><p className="section-label">PROJECT UNAVAILABLE</p><h1 className="section-title">This world is taking a moment.</h1><p className="contact-intro">Please try again shortly.</p><div className="hero-actions"><button type="button" className="hero-cta" onClick={reset}>Try again</button><Link className="text-link" href="/#work">Back to selected work</Link></div></main>;
}
