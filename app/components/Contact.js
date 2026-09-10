function safeProfile(value) {
  try { const url = new URL(value); return url.protocol === 'https:' ? url.href : null; } catch { return null; }
}
export default function Contact() {
  const email = process.env.PORTFOLIO_EMAIL;
  const profiles = [['GitHub', process.env.PORTFOLIO_GITHUB], ['Itch.io', process.env.PORTFOLIO_ITCH], ['LinkedIn', process.env.PORTFOLIO_LINKEDIN], ['Twitter', process.env.PORTFOLIO_TWITTER]].map(([label, value]) => ({ label, href: safeProfile(value) })).filter(profile => profile.href);
  const emailHref = email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? `mailto:${email}` : null;
  return <section id="contact" className="section contact-section" aria-labelledby="contact-title">
    <p className="section-label">Say hey</p><h2 id="contact-title" className="section-title">Got a weird idea?<br /><em>I’m listening.</em></h2>
    <p className="contact-intro">Talk games, swap ideas, or tell me about something you want to make.</p>
    <div className="contact-links">{emailHref && <a href={emailHref}>Say hello ↗</a>}{profiles.map(profile => <a key={profile.label} href={profile.href} target="_blank" rel="noopener noreferrer">{profile.label} ↗</a>)}</div>
    {!emailHref && profiles.length === 0 && <p className="contact-pending">Contact details will be added soon.</p>}
    <footer className="portfolio-footer"><span>© {new Date().getFullYear()} Ahsan Tariq</span><span>Crafted with care. Made for play.</span><a href="#hero">Back to top ↑</a></footer>
  </section>;
}
