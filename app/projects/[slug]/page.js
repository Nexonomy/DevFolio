import { notFound } from 'next/navigation';
import GameDetail from '@/app/components/GameDetail';
import { getPublishedGame, isDemo } from '@/lib/portfolio';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const project = await getPublishedGame(slug);
  return project ? { title:project.title + ' — Ahsan Tariq', description:project.description } : { title:'Project Not Found' };
}

export default async function ProjectPage({ params }) {
  const { slug } = await params;
  const project = await getPublishedGame(slug);
  if (!project || project.portfolioSection !== 'OTHER') notFound();
  return <main id="main">{isDemo && <p className="detail-demo-notice">Design preview · Sample non-game project.</p>}<GameDetail game={project} /></main>;
}