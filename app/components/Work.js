import Link from 'next/link';
import Image from 'next/image';
import { getBlobDeliveryUrl } from '@/lib/blob';

const contextLabels = { PERSONAL: 'Personal', COMPANY: 'Company', ACADEMIC: 'Academic', HACKATHON: 'Hackathon' };
const categories = (project) => (project.categories?.length ? project.categories : [project.tag]).filter(Boolean);

export default function Work({ games = [] }) {
  return <section id="work" className="section work-section" aria-labelledby="work-title">
    <header className="section-heading"><h2 id="work-title">Projects</h2><p>Games and interactive work.</p></header>
    {games.length === 0 ? <p className="empty-state">Projects will appear here when they are ready.</p> : <div className="project-list">
      {games.map((project, index) => <Link key={project.id || project.slug} href={'/games/' + project.slug} className="project-row" aria-label={'Open ' + project.title + ' project details'}>
        <div className="project-card-head"><span className="project-thumb">{project.coverImageUrl ? <Image src={getBlobDeliveryUrl(project.coverImageUrl)} alt="" fill className="card-cover-image" sizes="88px" /> : <span style={{ backgroundColor: project.bgColor }} aria-hidden="true">{project.emoji || '✦'}</span>}</span><div className="project-card-label"><p className="project-meta">{String(index + 1).padStart(2, '0')} · {contextLabels[project.projectContext] || 'Personal'}</p><span>{project.year || 'In progress'}</span></div><span className="project-open" aria-hidden="true">↗</span></div>
        <div className="project-copy"><h3>{project.title}</h3><p>{project.description}</p><p className="project-tech">{project.tech}</p><div className="project-tags">{categories(project).map((tag) => <span key={tag}>{tag}</span>)}</div></div>
      </Link>)}
    </div>}
  </section>;
}
