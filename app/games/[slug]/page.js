import { notFound } from 'next/navigation';
import GameDetail from '@/app/components/GameDetail';
import { prisma } from '@/lib/prisma';
import { gameInclude } from '@/lib/games';
import { resolveGameMediaUrls } from '@/lib/blob';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const { slug } = await params;

  const game = await prisma.game.findFirst({
    where: { slug, published: true },
  });

  if (!game) {
    return { title: 'Game Not Found' };
  }

  return {
    title: `${game.title} — Game Developer Portfolio`,
    description: game.description,
  };
}

export default async function GamePage({ params }) {
  const { slug } = await params;

  const game = await prisma.game.findFirst({
    where: { slug, published: true },
    include: gameInclude,
  });

  if (!game) {
    notFound();
  }

  const resolvedGame = await resolveGameMediaUrls(game);

  return <GameDetail game={resolvedGame} />;
}
