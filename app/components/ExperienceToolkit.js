export default function ExperienceToolkit({ experiences = [] }) {
  return <section id="experience" className="section experience-section" aria-labelledby="experience-title">
    <header className="section-heading"><h2 id="experience-title">Experience</h2><p>Roles and teams I have learned from.</p></header>
    <ol className="experience-list">
      {experiences.map((item) => <li key={item.role + item.period} className="experience-item"><time>{item.period}</time><div className="experience-copy"><div className="experience-title-row"><h3>{item.role}</h3>{item.current && <span>Current</span>}</div><p className="experience-organization">{item.organization} · {item.type}</p><p>{item.description}</p></div></li>)}
    </ol>
  </section>;
}
