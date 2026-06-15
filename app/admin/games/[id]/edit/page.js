import { notFound } from 'next/navigation';
import GameForm from '@/app/components/admin/GameForm';
import { prisma } from '@/lib/prisma';
import { gameInclude } from '@/lib/games';

export const dynamic = 'force-dynamic';

export default async function EditGamePage({ params }) {
  const { id } = await params;

  const game = await prisma.game.findUnique({
    where: { id },
    include: gameInclude,
  });

  if (!game) {
    notFound();
  }

  return (
    <div className="admin-page">
      <GameForm key={game.id} game={game} />
    </div>
  );
}
