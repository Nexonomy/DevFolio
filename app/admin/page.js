import Link from 'next/link';
import GameList from '@/app/components/admin/GameList';
import { prisma } from '@/lib/prisma';
import { gameInclude } from '@/lib/games';
import { readDemoProjects } from '@/lib/demo-store';
import { isDemo } from '@/lib/portfolio';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  let games = [];
  let databaseUnavailable = false;

  if (isDemo) {
    games = await readDemoProjects();
  } else if (!process.env.DATABASE_URL) {
    databaseUnavailable = true;
  } else {
    try {
      games = await prisma.game.findMany({
        include: gameInclude,
        orderBy: [{ sortOrder:'asc' }, { createdAt:'desc' }],
      });
    } catch (error) {
      console.error('Failed to load admin games:', error);
      databaseUnavailable = true;
    }
  }

  const readOnly = databaseUnavailable;
  const gameCount = games.filter((game) => game.portfolioSection !== 'OTHER').length;
  const otherCount = games.length - gameCount;
  const publishedCount = games.filter((game) => game.published).length;

  return (
    <div className="admin-page admin-dashboard">
      <section className="admin-dashboard-hero">
        <div>
          <p className="admin-kicker">Portfolio control room</p>
          <h1 className="admin-title">Project library.</h1>
          <p className="admin-subtitle">Search, sort, edit, and publish every game world and side quest from one clear workspace.</p>
        </div>
        {!readOnly && <Link href="/admin/games/new" className="admin-button admin-button-primary"><span aria-hidden="true">+</span> New Project</Link>}
      </section>

      <div className="admin-stats" aria-label="Portfolio project summary">
        <article><span>All projects</span><strong>{String(games.length).padStart(2, '0')}</strong><i>Complete library</i></article>
        <article><span>Game worlds</span><strong>{String(gameCount).padStart(2, '0')}</strong><i>Main portfolio</i></article>
        <article><span>Side quests</span><strong>{String(otherCount).padStart(2, '0')}</strong><i>Other things</i></article>
        <article><span>Live now</span><strong>{String(publishedCount).padStart(2, '0')}</strong><i>Published</i></article>
      </div>

      {isDemo && (
        <div className="admin-preview-notice">
          <strong>Local studio mode</strong>
          <span>Create, edit, publish, and delete freely. Changes stay on this computer in <code>.demo-data/projects.json</code>.</span>
        </div>
      )}
      {databaseUnavailable && (
        <div className="admin-preview-notice admin-preview-error">
          <strong>Database unavailable</strong>
          <span>Set DATABASE_URL to enable project management.</span>
        </div>
      )}

      <div className="admin-library-heading">
        <div><p className="admin-kicker">Content shelf</p><h2>Everything on display</h2></div>
        <span>{games.length} entries</span>
      </div>
      <GameList games={games} readOnly={readOnly} />
    </div>
  );
}
