import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/api-auth';
import { gameInclude, parseGameBody } from '@/lib/games';
import { createDemoProject, readDemoProjects } from '@/lib/demo-store';
import { isDemo } from '@/lib/portfolio';

export async function GET(request) {
  try {
    const session = await requireAuth();
    const { searchParams } = new URL(request.url);
    const adminView = searchParams.get('admin') === 'true' && session;

    if (isDemo) {
      const projects = await readDemoProjects();
      return NextResponse.json(adminView ? projects : projects.filter((project) => project.published));
    }

    const games = await prisma.game.findMany({
      where: adminView ? undefined : { published: true },
      include: gameInclude,
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    });
    return NextResponse.json(games);
  } catch (error) {
    console.error('GET /api/games error:', error);
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await requireAuth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const data = parseGameBody(await request.json());

    if (isDemo) {
      const projects = await readDemoProjects();
      if (projects.some((project) => project.slug === data.slug)) return NextResponse.json({ error: 'Slug already exists' }, { status: 409 });
      return NextResponse.json(await createDemoProject(data), { status: 201 });
    }

    const existing = await prisma.game.findUnique({ where: { slug: data.slug } });
    if (existing) return NextResponse.json({ error: 'Slug already exists' }, { status: 409 });

    const game = await prisma.game.create({
      data: {
        title:data.title, slug:data.slug, description:data.description, tag:data.tag,
        categories:data.categories, tech:data.tech, year:data.year, emoji:data.emoji,
        bgColor:data.bgColor, coverImageUrl:data.coverImageUrl, published:data.published,
        sortOrder:data.sortOrder, portfolioSection:data.portfolioSection, projectContext:data.projectContext,
        screenshots:{ create:data.screenshots.filter((item) => item.url) },
        videos:{ create:data.videos.filter((item) => item.youtubeUrl) },
      },
      include:gameInclude,
    });
    return NextResponse.json(game, { status:201 });
  } catch (error) {
    console.error('POST /api/games error:', error);
    const message = error.message?.includes('Missing required') ? error.message : 'Failed to create project';
    return NextResponse.json({ error:message }, { status:400 });
  }
}
