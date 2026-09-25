/* eslint-disable @next/next/no-img-element */

import DoodleGame from './DoodleGame';

export default function Hero({ profile }) {
  const links = [['Email', profile.email ? 'mailto:' + profile.email : null], ['GitHub', profile.githubUrl], ['LinkedIn', profile.linkedinUrl], ['Résumé', profile.resumeUrl]].filter((item) => item[1]);
  const tools = profile.tools.map((tool) => tool.name).join(' · ');
  return <section id="hero" className="hero" aria-labelledby="hero-title">
    <div className="hero-copy">
      <p className="hero-eyebrow">Game developer &amp; designer</p>
      <h1 id="hero-title">{profile.name}</h1>
      <p className="hero-lead">{profile.heroSubtitle}</p>
      <div className="hero-bio">{profile.bioParagraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div>
      <div className="hero-links">{links.map(([label, href]) => <a key={label} href={href} target={String(href).startsWith('http') ? '_blank' : undefined} rel={String(href).startsWith('http') ? 'noopener noreferrer' : undefined} download={label === 'Résumé' ? true : undefined}>{label}<span aria-hidden="true">↗</span></a>)}</div>
    </div>
    <figure className="hero-portrait">
      {profile.profileImageUrl ? <img src={profile.profileImageUrl} alt={profile.name + ' portrait'} /> : <span aria-hidden="true">{profile.name.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase()}</span>}
      <figcaption><strong>{profile.heroLead}</strong><small>{profile.heroAccent}</small></figcaption>
    </figure>
    <div className="hero-details">
      <div className="hero-tools"><span>Tools</span><p>{tools}</p></div>
      <DoodleGame />
    </div>
  </section>;
}
