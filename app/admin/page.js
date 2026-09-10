import Link from 'next/link';
import GameList from '@/app/components/admin/GameList';
import { prisma } from '@/lib/prisma';
import { gameInclude } from '@/lib/games';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const games = await prisma.game.findMany({
    include: gameInclude,
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
  });

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-title">Game Projects</h1>
          <p className="admin-subtitle">Manage your portfolio games from one place.</p>
        </div>
        <Link href="/admin/games/new" className="admin-button admin-button-primary">
          + New Game
        </Link>
      </div>
      <GameList games={games} />
    </div>
  );
}
