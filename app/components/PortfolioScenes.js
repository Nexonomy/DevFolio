'use client';

import { useState } from 'react';
import Image from 'next/image';
import OtherProjects from './OtherProjects';
import { ProjectTransitionLink } from './ProjectTransition';
import RetroEasterEggs from './easter-eggs/RetroEasterEggs';
import SecretChest from './easter-eggs/SecretChest';
import GameEasterEgg from './easter-eggs/GameEasterEgg';
import RetroAudioToggle from './easter-eggs/RetroAudioToggle';
import AnimatedContent from './reactbits/AnimatedContent';
import ClickSpark from './reactbits/ClickSpark';
import GlareHover from './reactbits/GlareHover';
import FilterRail from './FilterRail';

const projectPlaceholders = [
  '/project-placeholders/magic-student.png',
  '/project-placeholders/luggage-character.png',
];
const sceneLinks = [
  { href: '#intro', number: '01', label: 'Intro', kind: 'intro' },
  { href: '#portfolio', number: '02', label: 'Work', kind: 'work' },
  { href: '#other-projects', number: '03', label: 'Other', kind: 'other' },
  { href: '#experience', number: '04', label: 'Experience', kind: 'experience' },
  { href: '#contact', number: '05', label: 'Contact', kind: 'contact' },
];
function SceneLink({ href, number, label, kind }) {
  const animatedLabel = kind === 'work'
    ? [...label].map((letter, index) => <span className="saad-nav-letter" style={{ '--letter-index': index }} key={`${letter}-${index}`}>{letter}</span>)
    : label;

  return (
    <a className={`saad-nav-link saad-nav-link--${kind}`} href={href} aria-label={`${number} ${label}`}>
      <span className="saad-nav-index" aria-hidden="true">{number}</span>
      <i className="saad-nav-charm" aria-hidden="true">
        {kind === 'intro' && <span className="saad-nav-caret">_</span>}
        {kind === 'work' && <span className="saad-nav-hammer">⌁</span>}
        {kind === 'other' && <span className="saad-nav-dpad">✣</span>}
        {kind === 'experience' && <span className="saad-nav-xp"><b /></span>}
        {kind === 'contact' && <span className="saad-nav-chat">hi!</span>}
      </i>
      <span className="saad-nav-label" aria-hidden="true">{animatedLabel}</span>
    </a>
  );
}

function SceneNav({ initials }) {
  return (
    <nav className="saad-nav" aria-label="Portfolio sections">
      <a className="saad-mark" href="#intro" aria-label="Back to introduction">{initials}<span>.</span></a>
      <div>{sceneLinks.map((link) => <SceneLink {...link} key={link.href} />)}</div>
    </nav>
  );
}

function ExperienceMark({ item, index }) {
  const [imageFailed, setImageFailed] = useState(false);
  const number = String(index + 1).padStart(2, '0');

  if (!item.logoImageUrl || imageFailed) {
    return <span className="saad-experience-index" aria-label={`Experience ${number}`}>{number}</span>;
  }

  return (
    <span className="saad-experience-index has-logo">
      <Image
        src={item.logoImageUrl}
        alt=""
        fill
        sizes="42px"
        onError={() => setImageFailed(true)}
      />
    </span>
  );
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
            <ExperienceMark item={item} index={index} />
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
          <h1>Hi, I’m<br /><em>{[...profile.name.split(' ')[0]].map((letter, index) => <span className="saad-name-letter" style={{ '--name-index': index }} key={`${letter}-${index}`}>{letter}</span>)}.</em></h1>
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
            <span className="saad-portrait-player" aria-hidden="true">PLAYER 01</span>
            <i className="saad-portrait-scan" aria-hidden="true" />
          </div>
          <figcaption><b>I build playable ideas.</b><span>Code · systems · worlds</span></figcaption>
          <i className="saad-doodle saad-doodle-one" aria-hidden="true">✦</i>
          <i className="saad-doodle saad-doodle-two" aria-hidden="true">↝</i>
        </figure>

        <GameEasterEgg kind="mushroom" />
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

        <FilterRail
          items={gameGenres}
          value={gameFilter}
          onChange={setGameFilter}
          label="Filter game projects by genre"
        />

        <AnimatedContent delay={0.08}>
        <div className={`saad-project-grid ${gameFilter === 'All' ? '' : 'is-filtered'}`}>
          {visibleGames.length === 0 && <div className="saad-project-empty"><span>PROJECTS NOT CONNECTED</span><p>Connect your portfolio database and publish your game projects to show them here.</p></div>}
          {visibleGames.map((game) => {
            const index = games.indexOf(game);
            return (
            <ProjectTransitionLink href={`/games/${game.slug}`} className={`saad-project-card saad-project-${index + 1}`} key={game.id || game.slug}>
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
            </ProjectTransitionLink>
            );
          })}
        </div>
        </AnimatedContent>
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
        <FilterRail
          items={['All', 'Professional', 'Academic']}
          value={experienceFilter}
          onChange={setExperienceFilter}
          label="Filter experience by track"
          className="experience-filter-nav"
        />
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
        <div className="retro-audio-dock"><RetroAudioToggle /></div>
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
            <div className="retro-footer-controls"><SecretChest /></div>
          </div>
        </div>
      </section>
    </div>
    </ClickSpark>
  );
}
