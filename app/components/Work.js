import Link from 'next/link';
import Image from 'next/image';
import { getBlobDeliveryUrl } from '@/lib/blob';

const contextLabels = {
  PERSONAL: 'Personal project',
  COMPANY: 'Company project',
  ACADEMIC: 'Academic project',
  HACKATHON: 'Hackathon',
};

export default function Work({ games = [] }) {
  return <section id="work" className="section work-section" aria-labelledby="work-title">
    <div className="section-heading"><div><p className="section-label">Game development & design</p><h2 id="work-title" className="section-title">Choose your next adventure.</h2></div><p>Playable ideas and curious experiments I kept pushing until they felt alive.</p></div>
    {games.length === 0 ? <div className="work-empty"><span aria-hidden="true">✳</span><h3>The next adventure is taking shape.</h3><p>Games will appear here when they are ready to share.</p></div> : <div className="work-grid">
      {games.map((project, index) => <article key={project.id} className={'project-card project-' + (index + 1) + (index === 0 ? ' project-featured' : '')} style={{ '--project-accent':project.bgColor }}>
        <Link href={'/games/' + project.slug} className="card-thumbnail" style={{ backgroundColor:project.bgColor }} aria-label={'Explore ' + project.title} tabIndex={-1}>
          {project.coverImageUrl ? <Image src={getBlobDeliveryUrl(project.coverImageUrl)} alt={project.title} fill className="card-cover-image" sizes={index === 0 ? '(max-width: 760px) 100vw, 60vw' : '(max-width: 760px) 100vw, 40vw'} /> : <div className="project-art" aria-hidden="true"><span className="art-orbit" /><span className="art-symbol">{project.emoji || '✳'}</span><span className="art-caption">{project.tag} / {project.year || 'IN DEVELOPMENT'}</span></div>}
          <span className="card-tag">{index === 0 ? '★ Featured adventure' : 'Adventure ' + (index + 1)}</span>
        </Link>
        <div className="card-body">
          <div className="project-badge-row"><span className="project-context-badge">{contextLabels[project.projectContext] || 'Personal project'}</span><p className="card-index">{project.tag}{project.year ? ' · ' + project.year : ''}</p></div>
          <h3 className="card-title">{project.title}</h3><p className="card-description">{project.description}</p><p className="card-tech">{project.tech}</p>
          <Link href={'/games/' + project.slug} className="card-button" aria-label={'Enter project: ' + project.title}>Play the story <span aria-hidden="true">↗</span></Link>
        </div>
      </article>)}
    </div>}
  </section>;
}