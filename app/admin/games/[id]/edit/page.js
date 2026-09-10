import Link from 'next/link';
import { notFound } from 'next/navigation';
import GameForm from '@/app/components/admin/GameForm';
import { prisma } from '@/lib/prisma';
import { gameInclude } from '@/lib/games';
import { resolveGameMediaUrls } from '@/lib/blob';
import { isDemo } from '@/lib/portfolio';

export const dynamic = 'force-dynamic';

export default async function EditGamePage({ params }) {
  if (isDemo || !process.env.DATABASE_URL) {
    return (
      <div className="admin-page">
        <div className="admin-editor-unavailable">
          <p className="admin-kicker">Preview mode</p>
          <h1 className="admin-title">Editing is available with a connected database.</h1>
          <p>The sample projects remain read-only in this local preview.</p>
          <Link href="/admin" className="admin-button admin-button-primary">Back to dashboard</Link>
        </div>
      </div>
    );
  }

  const { id } = await params;
  const game = await prisma.game.findUnique({ where:{ id }, include:gameInclude });
  if (!game) notFound();
  const resolvedGame = await resolveGameMediaUrls(game);

  return <div className="admin-page"><GameForm key={resolvedGame.id} game={resolvedGame} /></div>;
}