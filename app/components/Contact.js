function safeProfile(value) { try { const url = new URL(value); return url.protocol === 'https:' ? url.href : null; } catch { return null; } }

export default function Contact({ profile }) {
  const email = profile.email;
  const emailHref = email && email.includes('@') && email.includes('.') ? 'mailto:' + email : null;
  const links = [['Email', emailHref, email], ['GitHub', safeProfile(profile.githubUrl), 'View profile'], ['LinkedIn', safeProfile(profile.linkedinUrl), 'Connect'], ['Résumé', profile.resumeUrl, 'Download PDF']].filter((item) => item[1]);

  return <section id="contact" className="section contact-section" aria-labelledby="contact-title">
    <div className="contact-card"><h2 id="contact-title">Contact</h2><p>Have a role, project, or strange idea in mind? I’m always happy to talk games and interactive experiences.</p>{emailHref && <a className="contact-email" href={emailHref}>{email}</a>}
      <div className="contact-links">{links.map(([label, href, detail]) => <a key={label} href={href} target={href.startsWith('http') ? '_blank' : undefined} rel={href.startsWith('http') ? 'noopener noreferrer' : undefined} download={label === 'Résumé' ? true : undefined}><span>{label}</span><small>{detail}</small><b aria-hidden="true">↗</b></a>)}</div>
    </div>
    <footer className="portfolio-footer"><span>© {new Date().getFullYear()} {profile.name}</span><span>Game developer &amp; designer</span><a href="#hero">Back to top ↑</a></footer>
  </section>;
}
