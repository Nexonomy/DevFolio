import { notFound } from 'next/navigation';
import GameDetail from '@/app/components/GameDetail';
import { getPublishedGame, getPublishedGames, isDemo } from '@/lib/portfolio';

export const revalidate = 3600;

export async function generateStaticParams() {
  const games = await getPublishedGames();
  return games
    .filter((game) => game.portfolioSection !== 'OTHER')
    .map((game) => ({ slug:game.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const game = await getPublishedGame(slug);
  return game ? { title: `${game.title} — Ahsan Tariq`, description: game.description } : { title: 'Game Not Found' };
}
export default async function GamePage({ params }) {
  const { slug } = await params;
  const game = await getPublishedGame(slug);
  if (!game || game.portfolioSection === 'OTHER') notFound();
  return <main id="main">{isDemo && <p className="detail-demo-notice">Game development case study · Ahsan Tariq</p>}<GameDetail game={game} /></main>;
}
