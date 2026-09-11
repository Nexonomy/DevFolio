import Link from 'next/link';
import { notFound } from 'next/navigation';
import GameForm from '@/app/components/admin/GameForm';
import { prisma } from '@/lib/prisma';
import { gameInclude } from '@/lib/games';
import { resolveGameMediaUrls } from '@/lib/blob';
import { readDemoProjects } from '@/lib/demo-store';
import { isDemo } from '@/lib/portfolio';

export const dynamic = 'force-dynamic';

export default async function EditGamePage({ params }) {
  if (!isDemo && !process.env.DATABASE_URL) {
    return <div className="admin-page"><div className="admin-editor-unavailable"><p className="admin-kicker">Database unavailable</p><h1 className="admin-title">Editing needs a database connection.</h1><Link href="/admin" className="admin-button admin-button-primary">Back to dashboard</Link></div></div>;
  }

  const { id } = await params;
  const game = isDemo
    ? (await readDemoProjects()).find((project) => project.id === id)
    : await prisma.game.findUnique({ where:{ id }, include:gameInclude });
  if (!game) notFound();

  const resolvedGame = isDemo ? game : await resolveGameMediaUrls(game);
  return <div className="admin-page"><GameForm key={resolvedGame.id} game={resolvedGame} /></div>;
}
