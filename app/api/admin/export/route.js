import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api-auth';
import { getProfile } from '@/lib/profile';
import { prisma } from '@/lib/prisma';
import { gameInclude } from '@/lib/games';
import { readDemoProjects } from '@/lib/demo-store';
import { isDemo } from '@/lib/portfolio';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function loadProjects() {
  if (isDemo) return readDemoProjects();
  if (!process.env.DATABASE_URL) return [];
  try {
    return await prisma.game.findMany({ include: gameInclude, orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }] });
  } catch (error) {
    console.error('[export] failed to load projects:', error);
    return [];
  }
}

export async function GET() {
  const session = await requireAuth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const [profile, projects] = await Promise.all([getProfile(), loadProjects()]);

  const games = projects.filter((project) => (project.portfolioSection || 'GAME') === 'GAME');
  const otherProjects = projects.filter((project) => project.portfolioSection === 'OTHER');

  const payload = {
    schemaVersion: 1,
    exportedAt: new Date().toISOString(),
    source: isDemo ? 'demo-store' : 'prisma',
    counts: { games: games.length, otherProjects: otherProjects.length, published: projects.filter((project) => project.published).length },
    profile,
    games,
    otherProjects,
  };

  const stamp = new Date().toISOString().replace(/[:T]/g, '-').slice(0, 19);
  const filename = `devfolio-portfolio-${stamp}.json`;

  return new NextResponse(JSON.stringify(payload, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  });
}
