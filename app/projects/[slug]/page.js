import { notFound } from 'next/navigation';
import GameDetail from '@/app/components/GameDetail';
import { getPublishedGame, getPublishedGames, isDemo } from '@/lib/portfolio';

export const revalidate = 3600;

export async function generateStaticParams() {
  const projects = await getPublishedGames();
  return projects
    .filter((project) => project.portfolioSection === 'OTHER')
    .map((project) => ({ slug:project.slug }));
}

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
