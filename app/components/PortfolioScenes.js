'use client';

import { useState } from 'react';
import Image from 'next/image';
import OtherProjects from './OtherProjects';
import { ProjectTransitionLink } from './ProjectTransition';
import RetroEasterEggs from './easter-eggs/RetroEasterEggs';
import SecretChest from './easter-eggs/SecretChest';
import GameEasterEgg from './easter-eggs/GameEasterEgg';
import RetroAudioToggle from './easter-eggs/RetroAudioToggle';
import BackgroundMusic from './easter-eggs/BackgroundMusic';
import AnimatedContent from './reactbits/AnimatedContent';
import ClickSpark from './reactbits/ClickSpark';
import GlareHover from './reactbits/GlareHover';
import FilterRail from './FilterRail';

const FEATURED_GAME_COUNT = 6;
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

function groupByOrganization(items) {
  const groups = [];
  for (const item of items) {
    const last = groups.at(-1);
    if (last && item.organization && last.organization === item.organization) last.roles.push(item);
    else groups.push({ organization: item.organization, roles: [item] });
  }
  return groups;
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
        {groupByOrganization(items).map((group, index) => (
          <li key={`${group.organization}-${index}`} className={group.roles.length > 1 ? 'is-grouped' : undefined}>
            <ExperienceMark item={group.roles[0]} index={index} />
            {group.roles.length === 1 ? (
              <div className="saad-experience-card">
                <div className="saad-experience-meta"><time>{group.roles[0].period}</time><small>{group.roles[0].type}</small></div>
                <h4>{group.roles[0].role}</h4>
                <b>{group.organization}</b>
                <p>{group.roles[0].description}</p>
              </div>
            ) : (
              <div className="saad-experience-card">
                <div className="saad-experience-meta"><time>{group.roles.length} roles</time><small>{group.roles.some((role) => role.current) ? 'Current' : 'Company'}</small></div>
                <h4>{group.organization}</h4>
                <ol className="saad-role-tree">
                  {group.roles.map((role, roleIndex) => (
                    <li key={`${role.role}-${roleIndex}`}>
                      <div className="saad-experience-meta"><time>{role.period}</time><small>{role.type}</small></div>
                      <h5>{role.role}</h5>
                      <p>{role.description}</p>
                    </li>
                  ))}
                </ol>
              </div>
            )}
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
  const [showAllGames, setShowAllGames] = useState(false);
  const filteredGames = gameFilter === 'All' ? games : games.filter((game) => game.tag === gameFilter);
  const hiddenGameCount = Math.max(filteredGames.length - FEATURED_GAME_COUNT, 0);
  const visibleGames = showAllGames ? filteredGames : filteredGames.slice(0, FEATURED_GAME_COUNT);

  const [contactSending, setContactSending] = useState(false);

  const sendContactEmail = async (event) => {
    event.preventDefault();
    if (!profile.email || contactSending) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    const payload = {
      name: data.get('name') || '',
      email: data.get('email') || '',
      subject: data.get('subject') || '',
      message: data.get('message') || '',
      company: data.get('company') || '',
    };

    setContactSending(true);
    setContactStatus('Sending your message…');
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await response.json().catch(() => ({}));
      if (response.ok) {
        setContactStatus(`Message sent — ${profile.email} will reply soon.`);
        form.reset();
      } else if (result.fallback) {
        const subject = payload.subject || 'Portfolio enquiry';
        const body = `Hi ${profile.name.split(' ')[0]},\n\n${payload.message}\n\nFrom: ${payload.name}\nEmail: ${payload.email}`;
        setContactStatus('Email service is offline — opening your email app as a fallback…');
        window.location.href = `mailto:${profile.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      } else {
        setContactStatus(result.error || 'Could not send right now. Please try again.');
      }
    } catch {
      setContactStatus('Network error — please try again or email directly.');
    } finally {
      setContactSending(false);
    }
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
        {hiddenGameCount > 0 && (
          <div className="saad-see-more">
            <button type="button" onClick={() => setShowAllGames((value) => !value)} aria-expanded={showAllGames}>
              <span>{showAllGames ? 'Show fewer projects' : `See ${hiddenGameCount} more project${hiddenGameCount === 1 ? '' : 's'}`}</span>
              <b aria-hidden="true">{showAllGames ? '↑' : '↓'}</b>
            </button>
          </div>
        )}
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
        <div className="retro-audio-dock"><BackgroundMusic /><RetroAudioToggle /></div>
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
              <input type="text" name="company" tabIndex="-1" autoComplete="off" aria-hidden="true" style={{ position: 'absolute', left: '-10000px', width: '1px', height: '1px', opacity: 0, pointerEvents: 'none' }} />
              <button type="submit" disabled={contactSending}><span>{contactSending ? 'Sending…' : 'Send message'}</span><b aria-hidden="true">↗</b></button>
              <p className="saad-contact-status" aria-live="polite">{contactStatus || `Messages are delivered to ${profile.email}.`}</p>
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
