import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/api-auth';
import { readDemoProjects, updateDemoProject } from '@/lib/demo-store';
import { isDemo } from '@/lib/portfolio';
import { revalidatePortfolio } from '@/lib/revalidate-portfolio';

// Saves the public display order: each id gets sortOrder equal to its position.
export async function POST(request) {
  try {
    const session = await requireAuth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await request.json().catch(() => ({}));
    const ids = Array.isArray(body.ids) ? body.ids.filter((id) => typeof id === 'string').slice(0, 200) : [];
    if (!ids.length) return NextResponse.json({ error: 'No projects to reorder' }, { status: 400 });

    if (isDemo) {
      for (const [index, id] of ids.entries()) await updateDemoProject(id, { sortOrder: index });
      revalidatePortfolio(...(await readDemoProjects()));
      return NextResponse.json({ ok: true });
    }

    const games = await prisma.$transaction(ids.map((id, index) => prisma.game.update({ where: { id }, data: { sortOrder: index } })));
    revalidatePortfolio(...games);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('POST /api/games/reorder error:', error);
    return NextResponse.json({ error: 'Failed to save order' }, { status: 500 });
  }
}
