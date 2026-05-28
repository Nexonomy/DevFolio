'use client';

const contacts = [
  { emoji: '📧', label: 'EMAIL', href: 'mailto:hello@example.com' },
  { emoji: '🐙', label: 'GITHUB', href: 'https://github.com' },
  { emoji: '🎮', label: 'ITCH.IO', href: 'https://itch.io' },
  { emoji: '💼', label: 'LINKEDIN', href: 'https://linkedin.com' },
  { emoji: '🐦', label: 'TWITTER', href: 'https://twitter.com' },
];

export default function Contact() {
  return (
    <section id="contact" className="section contact-section">
      <p className="section-label">✉ CONNECT ✉</p>
      <h2 className="section-title">CONTACT</h2>

      <div className="contact-icons">
        {contacts.map((c, i) => (
          <a
            key={i}
            href={c.href}
            className="contact-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className="contact-icon-box">
              <span>{c.emoji}</span>
            </div>
            <span className="contact-icon-label">{c.label}</span>
          </a>
        ))}
      </div>

      <p className="footer-tagline">— INSERT COIN TO CONTINUE —</p>
    </section>
  );
}
