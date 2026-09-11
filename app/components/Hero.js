import ThreeBackground from './ThreeBackground';

export default function Hero({ profile }) {
  return <section id="hero" className="hero" aria-labelledby="hero-title">
    <div className="hero-content">
      <p className="hero-eyebrow"><span aria-hidden="true">✦</span> {profile.heroEyebrow}</p>
      <h1 id="hero-title" className="hero-name">HEY, I’M {profile.name.split(' ')[0].toUpperCase()}<span>{profile.heroLead}<br /><em>{profile.heroAccent}</em></span></h1>
      <p className="hero-subtitle">{profile.heroSubtitle}</p>
      <div className="hero-actions"><a href="#work" className="hero-cta">Explore my games <span aria-hidden="true">↗</span></a><a href="#about" className="text-link">The human behind the code <span aria-hidden="true">→</span></a></div>
      <p className="hero-footnote">Usually building something. Always thinking about games.</p>
    </div>
    <div className="hero-world"><ThreeBackground /><div className="world-fallback" aria-hidden="true"><div className="world-sun" /><div className="world-hill hill-back" /><div className="world-hill hill-front" /></div></div>
    <div className="hero-strip"><span>GAME DEVELOPMENT</span><span aria-hidden="true">✦</span><span>INTERACTIVE WORLDS</span><span aria-hidden="true">✦</span><span>PIXEL ART & DESIGN</span></div>
  </section>;
}
