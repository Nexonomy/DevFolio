/* eslint-disable @next/next/no-img-element */

export default function About({ profile }) {
  const tools = profile.tools || [];
  const values = profile.values || [];
  return <section id="about" className="section about-section" aria-labelledby="about-title">
    <header className="section-heading"><h2 id="about-title">About</h2><p>{profile.bioTitle}</p></header>
    <div className="about-grid">
      <div className="about-profile">
        {profile.profileImageUrl ? <img src={profile.profileImageUrl} alt={profile.name + ' portrait'} /> : <span className="about-monogram" aria-hidden="true">{profile.name.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase()}</span>}
        <div><strong>{profile.name}</strong><span>Game developer &amp; designer</span></div>
      </div>
      <div className="about-text">{profile.bioParagraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}<ul className="about-values" aria-label="Creative values">{values.map((value) => <li key={value}>{value}</li>)}</ul></div>
    </div>
    <div id="tools" className="toolkit" aria-labelledby="toolkit-title"><h3 id="toolkit-title">Tools</h3><ul className="tool-list">{tools.map((tool) => <li key={tool.name}>{tool.name}</li>)}</ul></div>
  </section>;
}
