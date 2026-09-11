'use client';

function safeProfile(value) {
  try { const url = new URL(value); return url.protocol === 'https:' ? url.href : null; } catch { return null; }
}

export default function Contact() {
  const email = process.env.PORTFOLIO_EMAIL || 'ahsan02tariq@gmail.com';
  const profiles = [['GitHub', process.env.PORTFOLIO_GITHUB || 'https://github.com/Nexonomy'], ['LinkedIn', process.env.PORTFOLIO_LINKEDIN || 'https://www.linkedin.com/in/ahsantariq02'], ['Itch.io', process.env.PORTFOLIO_ITCH], ['Twitter', process.env.PORTFOLIO_TWITTER]].map(([label, value]) => ({ label, href: safeProfile(value) })).filter(profile => profile.href);
  const emailHref = email && email.includes('@') && email.includes('.') ? 'mailto:' + email : null;

  const composeEmail = (event) => {
    event.preventDefault();
    if (!emailHref) return;

    const data = new FormData(event.currentTarget);
    const name = String(data.get('name') || '').trim();
    const replyTo = String(data.get('replyTo') || '').trim();
    const context = String(data.get('context') || 'Portfolio enquiry').trim();
    const message = String(data.get('message') || '').trim();
    const subject = '[Portfolio] ' + context + ' - ' + name;
    const body = ['Hi Ahsan,', '', message, '', 'From: ' + name, 'Reply to: ' + replyTo].join(String.fromCharCode(10));

    window.location.href = emailHref + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
  };

  return <section id="contact" className="section contact-section" aria-labelledby="contact-title">
    <div className="contact-layout">
      <div className="contact-copy">
        <p className="section-label">Say hey</p>
        <h2 id="contact-title" className="section-title">Got a weird idea?<br /><em>I’m listening.</em></h2>
        <p className="contact-intro">Talk games, swap ideas, or tell me about something you want to make.</p>
        <div className="contact-links">
          {emailHref && <a href={emailHref}>{email} ↗</a>}
          {profiles.map(profile => <a key={profile.label} href={profile.href} target="_blank" rel="noopener noreferrer">{profile.label} ↗</a>)}
        </div>
      </div>

      {emailHref && <form className="contact-form" onSubmit={composeEmail}>
        <div className="contact-form-heading">
          <span aria-hidden="true">✦</span>
          <div><p>Start a conversation</p><small>Your email app opens with everything ready.</small></div>
        </div>
        <div className="contact-field-row">
          <label><span>Your name</span><input name="name" type="text" autoComplete="name" placeholder="What should I call you?" required /></label>
          <label><span>Your email</span><input name="replyTo" type="email" autoComplete="email" placeholder="you@example.com" required /></label>
        </div>
        <label><span>What is this about?</span>
          <select name="context" defaultValue="Game project">
            <option>Game project</option>
            <option>Job opportunity</option>
            <option>Creative collaboration</option>
            <option>Portfolio feedback</option>
            <option>Something else</option>
          </select>
        </label>
        <label><span>Your message</span><textarea name="message" rows="6" placeholder="Give me the context, the idea, or the problem you want to solve..." required /></label>
        <button type="submit">Compose email <span aria-hidden="true">↗</span></button>
      </form>}

      {!emailHref && profiles.length === 0 && <p className="contact-pending">Contact details will be added soon.</p>}
    </div>
    <footer className="portfolio-footer"><span>© {new Date().getFullYear()} Ahsan Tariq</span><span>Crafted with care. Made for play.</span><a href="#hero">Back to top ↑</a></footer>
  </section>;
}
