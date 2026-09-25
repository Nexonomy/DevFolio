'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import OtherProjects from './OtherProjects';
import RetroEasterEggs from './easter-eggs/RetroEasterEggs';
import SecretChest from './easter-eggs/SecretChest';
import GameEasterEgg from './easter-eggs/GameEasterEgg';
import RetroAudioToggle from './easter-eggs/RetroAudioToggle';
import AnimatedContent from './reactbits/AnimatedContent';
import ClickSpark from './reactbits/ClickSpark';
import GlareHover from './reactbits/GlareHover';
import PixelTransition from './reactbits/PixelTransition';

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const projectPlaceholders = [
  '/project-placeholders/magic-student.png',
  '/project-placeholders/luggage-character.png',
];

function SceneNav({ initials }) {
  return (
    <nav className="saad-nav" aria-label="Portfolio sections">
      <a className="saad-mark" href="#intro" aria-label="Back to introduction">{initials}<span>.</span></a>
      <div>
        <a href="#intro"><span>01</span> Intro</a>
        <a href="#portfolio"><span>02</span> Work</a>
        <a href="#other-projects"><span>03</span> Other</a>
        <a href="#experience"><span>04</span> Experience</a>
        <a href="#contact"><span>05</span> Contact</a>
      </div>
    </nav>
  );
}

function BasketballTransition() {
  const courtRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [ball, setBall] = useState({ x: 42, y: 148 });
  const [scored, setScored] = useState(false);

  const moveBall = (event) => {
    if (!dragging || !courtRef.current || scored) return;
    const box = courtRef.current.getBoundingClientRect();
    setBall({
      x: clamp(event.clientX - box.left, 18, box.width - 18),
      y: clamp(event.clientY - box.top, 18, box.height - 18),
    });
  };

  const finishShot = (event) => {
    if (!dragging || scored) return;
    setDragging(false);
    const box = courtRef.current?.getBoundingClientRect();
    const release = box && event ? {
      x: clamp(event.clientX - box.left, 18, box.width - 18),
      y: clamp(event.clientY - box.top, 18, box.height - 18),
    } : ball;
    setBall(release);
    if (Math.hypot(release.x - 220, release.y - 72) < 46) {
      setScored(true);
    }
  };

  const goToWork = () => {
    document.querySelector('#portfolio')?.scrollIntoView({ behavior: 'smooth' });
    window.history.replaceState(null, '', '#portfolio');
  };
  const skip = () => {
    setOpen(false);
    goToWork();
  };
  useEffect(() => {
    if (!scored) return undefined;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const midpoint = window.setTimeout(() => {
      document.querySelector('#portfolio')?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
      window.history.replaceState(null, '', '#portfolio');
    }, reduceMotion ? 0 : 750);
    const complete = window.setTimeout(() => {
      setOpen(false);
      setScored(false);
      setBall({ x: 42, y: 148 });
    }, reduceMotion ? 50 : 1900);
    return () => {
      window.clearTimeout(midpoint);
      window.clearTimeout(complete);
    };
  }, [scored]);

  if (!open) {
    return (
      <button type="button" className="saad-next-launch" onClick={() => setOpen(true)} aria-label="Play to enter selected work">
        <span>Next: selected work</span><b aria-hidden="true">↘</b>
      </button>
    );
  }

  return (
    <>
    <div className={`saad-court-shell ${scored ? 'is-scored' : ''}`}>
      <div className="saad-court-topline"><span>{scored ? 'Nice shot.' : 'Drag the ball into the hoop'}</span><button type="button" onClick={skip}>Skip →</button></div>
      <div
        ref={courtRef}
        className="saad-court"
        onPointerMove={moveBall}
        onPointerUp={finishShot}
        onPointerCancel={finishShot}
      >
        <span className="saad-court-line" aria-hidden="true" />
        <span className="saad-backboard" aria-hidden="true" />
        <span className="saad-hoop" aria-hidden="true" />
        <button
          type="button"
          className="saad-ball"
          aria-label="Basketball. Drag it into the hoop, or press Enter to shoot."
          style={{ left: ball.x, top: ball.y }}
          onKeyDown={(event) => {
            if ((event.key === 'Enter' || event.key === ' ') && !scored) {
              event.preventDefault();
              setScored(true);
            }
          }}
          onPointerDown={(event) => {
            event.currentTarget.setPointerCapture(event.pointerId);
            setDragging(true);
          }}
          onPointerUp={finishShot}
        ><i /></button>
        {scored && <span className="saad-score-burst" aria-hidden="true">SWISH!</span>}
      </div>
    </div>
    <PixelTransition active={scored} />
    </>
  );
}

function DownLink({ href, label }) {
  return <a className="saad-scene-next" href={href}><span>{label}</span><b aria-hidden="true">↓</b></a>;
}

function ExperienceGroup({ title, note, number, label, items }) {
  return (
    <section className="saad-experience-group" aria-labelledby={`${title.toLowerCase().replaceAll(' ', '-')}-title`}>
      <header className="saad-experience-group-head">
        <span>{number}</span>
        <div><p>{note}</p><h3 id={`${title.toLowerCase().replaceAll(' ', '-')}-title`}>{title}</h3></div>
        <b>{label}</b>
      </header>
      <ol className="saad-timeline">
        {items.map((item, index) => (
          <li key={`${item.role}-${index}`}>
            <span className="saad-experience-index">{String(index + 1).padStart(2, '0')}</span>
            <div className="saad-experience-card">
              <div className="saad-experience-meta"><time>{item.period}</time><small>{item.type}</small></div>
              <h4>{item.role}</h4>
              <b>{item.organization}</b>
              <p>{item.description}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

export default function PortfolioScenes({ profile, games, otherProjects, demoMode = false }) {
  const nameParts = profile.name.split(' ').filter(Boolean);
  const initials = `${nameParts[0]?.[0] || ''}${nameParts.at(-1)?.[0] || ''}`;
  const copy = profile.sectionCopy || {};
  const experiences = profile.experiences || [];
  const professionalExperience = experiences.filter((item) => item.track === 'PROFESSIONAL');
  const academicExperience = experiences.filter((item) => item.track !== 'PROFESSIONAL');
  const [contactStatus, setContactStatus] = useState('');
  const [gameFilter, setGameFilter] = useState('All');
  const [experienceFilter, setExperienceFilter] = useState('All');
  const gameGenres = ['All', ...new Set(games.map((game) => game.tag).filter(Boolean))];
  const visibleGames = gameFilter === 'All' ? games : games.filter((game) => game.tag === gameFilter);

  const sendContactEmail = (event) => {
    event.preventDefault();
    if (!profile.email) return;
    const data = new FormData(event.currentTarget);
    const name = data.get('name');
    const senderEmail = data.get('email');
    const subject = data.get('subject') || 'Portfolio enquiry';
    const message = data.get('message');
    const body = `Hi ${profile.name.split(' ')[0]},\n\n${message}\n\nFrom: ${name}\nEmail: ${senderEmail}`;
    setContactStatus('Opening your email app with the message ready to send…');
    window.location.href = `mailto:${profile.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <ClickSpark>
    <div className="saad-site">
      <RetroEasterEggs name={profile.name} />
      <a className="skip-link" href="#portfolio">Skip to projects</a>
      <SceneNav initials={initials} />

      <section className="saad-scene saad-intro" id="intro">
        <div className="saad-intro-copy">
          <p className="saad-kicker">{copy.introKicker}</p>
          <h1>Hi, I’m<br /><em>{profile.name.split(' ')[0]}.</em></h1>
          <p className="saad-intro-lead">{profile.heroSubtitle}</p>
          <div className="saad-intro-links">
            {profile.linkedinUrl && <a href={profile.linkedinUrl} target="_blank" rel="noreferrer">LinkedIn ↗</a>}
            {profile.githubUrl && <a href={profile.githubUrl} target="_blank" rel="noreferrer">GitHub ↗</a>}
            {profile.resumeUrl && <a href={profile.resumeUrl} target="_blank" rel="noreferrer">Résumé ↗</a>}
          </div>
        </div>

        <figure className="saad-portrait">
          <div className="saad-portrait-frame">
            {profile.profileImageUrl ? <Image src={profile.profileImageUrl} alt={profile.name} fill priority sizes="(max-width: 700px) 68vw, 34vw" /> : <span>{initials}<small>portrait</small></span>}
          </div>
          <figcaption><b>I build playable ideas.</b><span>Code · systems · worlds</span></figcaption>
          <i className="saad-doodle saad-doodle-one" aria-hidden="true">✦</i>
          <i className="saad-doodle saad-doodle-two" aria-hidden="true">↝</i>
        </figure>

        <GameEasterEgg kind="mushroom" />
        <BasketballTransition />
      </section>

      <section className="saad-scene saad-portfolio" id="portfolio">
        <AnimatedContent>
        <div className="saad-section-head">
          <p className="saad-kicker">02 / Portfolio</p>
          <h2>{copy.workTitle}</h2>
          <p>{copy.workDescription}</p>
        </div>
        </AnimatedContent>

        {demoMode && <p className="saad-demo-notice">Preview mode · Sample project entries are for layout preview only. Replace them with your own work before publishing.</p>}

        <nav className="project-filter-nav" aria-label="Filter game projects by genre">
          {gameGenres.map((genre) => <button type="button" key={genre} aria-pressed={gameFilter === genre} onClick={() => setGameFilter(genre)}>{genre}</button>)}
        </nav>

        <AnimatedContent delay={0.08}>
        <div className={`saad-project-grid ${gameFilter === 'All' ? '' : 'is-filtered'}`}>
          {visibleGames.length === 0 && <div className="saad-project-empty"><span>PROJECTS NOT CONNECTED</span><p>Connect your portfolio database and publish your game projects to show them here.</p></div>}
          {visibleGames.map((game) => {
            const index = games.indexOf(game);
            return (
            <Link href={`/games/${game.slug}`} className={`saad-project-card saad-project-${index + 1}`} key={game.id || game.slug}>
              <GlareHover className="saad-project-art" background={game.bgColor || '#242424'}>
                <Image
                  src={game.coverImageUrl || projectPlaceholders[index % projectPlaceholders.length]}
                  alt={`${game.title} project cover`}
                  fill
                  loading={index === 0 ? 'eager' : 'lazy'}
                  sizes="(max-width: 700px) 100vw, (max-width: 1250px) 50vw, 33vw"
                />
              </GlareHover>
              <div className="saad-project-info">
                <span>{String(index + 1).padStart(2, '0')} / {game.tag}</span>
                <h3>{game.title}</h3>
                <p>{game.description}</p>
                <ul>{(game.categories || []).slice(0, 3).map((category) => <li key={category}>{category}</li>)}</ul>
                <b aria-hidden="true">↗</b>
              </div>
            </Link>
            );
          })}
        </div>
        </AnimatedContent>
        <DownLink href="#other-projects" label="Next: other projects" />
        <GameEasterEgg kind="pacman" />
      </section>

      <OtherProjects projects={otherProjects} title={copy.otherTitle} description={copy.otherDescription} />

      <section className="saad-scene saad-experience" id="experience">
        <AnimatedContent>
        <div className="saad-section-head">
          <p className="saad-kicker">04 / Experience</p>
          <h2>{copy.experienceTitle}</h2>
          <p>{copy.experienceDescription}</p>
        </div>
        </AnimatedContent>
        <nav className="project-filter-nav experience-filter-nav" aria-label="Filter experience by track">
          {['All', 'Professional', 'Academic'].map((track) => <button type="button" key={track} aria-pressed={experienceFilter === track} onClick={() => setExperienceFilter(track)}>{track}</button>)}
        </nav>
        <div className="saad-experience-columns">
          {experienceFilter !== 'Academic' && <ExperienceGroup number="01" title="Professional experience" note="Industry and independent practice" label="Career track" items={professionalExperience} />}
          {experienceFilter !== 'Professional' && <ExperienceGroup number="02" title="Academic experience" note="Campus teams, societies, and jams" label="Learning track" items={academicExperience} />}
        </div>
        <div className="saad-toolbox">
          <div><span>Development toolkit</span><p>Tools I use to move from an idea to a playable build.</p></div>
          <ul>{(profile.tools || []).map((tool) => <li key={tool.name}>{tool.name}</li>)}</ul>
        </div>
        <GameEasterEgg kind="invader" />
      </section>

      <section className="saad-contact" id="contact" aria-labelledby="contact-title">
        <p className="saad-kicker">05 / Contact</p>
        <div className="saad-contact-grid">
          <div>
            <p>{copy.contactPrompt}</p>
            <h2 id="contact-title">{copy.contactTitle}</h2>
          </div>
          <div className="saad-contact-panel">
            <form className="saad-contact-form" onSubmit={sendContactEmail}>
              <div className="saad-contact-form-row">
                <label><span>Your name</span><input name="name" type="text" placeholder="Jane Smith" autoComplete="name" required /></label>
                <label><span>Your email</span><input name="email" type="email" placeholder="jane@studio.com" autoComplete="email" required /></label>
              </div>
              <label><span>Subject</span><input name="subject" type="text" placeholder="Let’s build something" /></label>
              <label><span>Message</span><textarea name="message" rows="4" placeholder="Tell me a little about the game, team, or opportunity…" required /></label>
              <button type="submit"><span>Continue to email</span><b aria-hidden="true">↗</b></button>
              <p className="saad-contact-status" aria-live="polite">{contactStatus || `This opens your email app with a message addressed to ${profile.email}.`}</p>
            </form>
            <div className="saad-contact-links">
              {profile.githubUrl && <a href={profile.githubUrl} target="_blank" rel="noreferrer">GitHub ↗</a>}
              {profile.linkedinUrl && <a href={profile.linkedinUrl} target="_blank" rel="noreferrer">LinkedIn ↗</a>}
              {profile.resumeUrl && <a href={profile.resumeUrl} target="_blank" rel="noreferrer">Résumé ↗</a>}
            </div>
            <div className="retro-footer-controls"><RetroAudioToggle /><SecretChest /></div>
          </div>
        </div>
      </section>
    </div>
    </ClickSpark>
  );
}
