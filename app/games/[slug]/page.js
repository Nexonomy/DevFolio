import { notFound } from 'next/navigation';
import GameDetail from '@/app/components/GameDetail';
import { getPublishedGame, isDemo } from '@/lib/portfolio';
export const dynamic = 'force-dynamic';
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const game = await getPublishedGame(slug);
  return game ? { title: `${game.title} — Ahsan Tariq`, description: game.description } : { title: 'Game Not Found' };
}
export default async function GamePage({ params }) {
  const { slug } = await params;
  const game = await getPublishedGame(slug);
  if (!game || game.portfolioSection === 'OTHER') notFound();
  return <main id="main">{isDemo && <p className="detail-demo-notice">Design preview · Sample project from the original repository.</p>}<GameDetail game={game} /></main>;
}
