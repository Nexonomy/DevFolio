import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { defaultProfile } from '@/lib/profile';
import { seedProjects } from '@/lib/portfolio-seed-projects';
import { revalidatePortfolio } from '@/lib/revalidate-portfolio';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request) {
  const session = await requireAuth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: 'DATABASE_URL is not configured. Nothing to sync.' }, { status: 503 });
  }

  const body = await request.json().catch(() => ({}));
  const scope = typeof body.scope === 'string' ? body.scope : 'all';

  const summary = {};

  try {
    if (scope === 'all' || scope === 'profile') {
      const { id: _ignored, ...profileData } = defaultProfile;
      const profile = await prisma.profile.upsert({
        where: { id: 'primary' },
        create: { id: 'primary', ...profileData },
        update: profileData,
      });
      summary.profile = {
        ok: true,
        id: profile.id,
        name: profile.name,
        experiences: Array.isArray(profile.experiences) ? profile.experiences.length : null,
      };
    }

    if (scope === 'all' || scope === 'projects') {
      const projectResults = [];
      for (const project of seedProjects) {
        const data = {
          title: project.title,
          description: project.description,
          tag: project.tag,
          categories: project.categories,
          tech: project.tech,
          year: project.year ?? null,
          emoji: project.emoji ?? null,
          bgColor: project.bgColor,
          published: project.published,
          sortOrder: project.sortOrder,
          portfolioSection: project.portfolioSection,
          projectContext: project.projectContext,
        };
        const existing = await prisma.game.findUnique({ where: { slug: project.slug } });
        const game = await prisma.game.upsert({
          where: { slug: project.slug },
          create: { slug: project.slug, ...data },
          update: data,
        });
        projectResults.push({ slug: game.slug, action: existing ? 'updated' : 'created' });
      }
      summary.projects = { ok: true, count: projectResults.length, details: projectResults };
    }

    // Bust the cached home and project pages so the sync is visible immediately.
    try {
      revalidatePortfolio(...seedProjects);
    } catch (revalError) {
      console.warn('[sync-content] revalidate warning:', revalError?.message);
    }

    return NextResponse.json({ ok: true, scope, summary });
  } catch (error) {
    console.error('[sync-content] failed:', error);
    return NextResponse.json({ ok: false, error: error.message, scope, summary }, { status: 500 });
  }
}
