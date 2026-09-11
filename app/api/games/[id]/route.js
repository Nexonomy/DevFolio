import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/api-auth';
import { gameInclude, parseGameBody } from '@/lib/games';
import { deleteDemoProject, readDemoProjects, updateDemoProject } from '@/lib/demo-store';
import { isDemo } from '@/lib/portfolio';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const session = await requireAuth();
    const adminView = new URL(request.url).searchParams.get('admin') === 'true' && session;

    if (isDemo) {
      const game = (await readDemoProjects()).find((project) => project.id === id);
      if (!game || (!adminView && !game.published)) return NextResponse.json({ error:'Project not found' }, { status:404 });
      return NextResponse.json(game);
    }

    const game = await prisma.game.findUnique({ where:{ id }, include:gameInclude });
    if (!game || (!adminView && !game.published)) return NextResponse.json({ error:'Project not found' }, { status:404 });
    return NextResponse.json(game);
  } catch (error) {
    console.error('GET /api/games/[id] error:', error);
    return NextResponse.json({ error:'Failed to fetch project' }, { status:500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const session = await requireAuth();
    if (!session) return NextResponse.json({ error:'Unauthorized' }, { status:401 });
    const { id } = await params;
    const data = parseGameBody(await request.json());

    if (isDemo) {
      const projects = await readDemoProjects();
      if (projects.some((project) => project.slug === data.slug && project.id !== id)) return NextResponse.json({ error:'Slug already exists' }, { status:409 });
      const game = await updateDemoProject(id, data);
      return game ? NextResponse.json(game) : NextResponse.json({ error:'Project not found' }, { status:404 });
    }

    const existing = await prisma.game.findUnique({ where:{ id } });
    if (!existing) return NextResponse.json({ error:'Project not found' }, { status:404 });
    const slugConflict = await prisma.game.findFirst({ where:{ slug:data.slug, NOT:{ id } } });
    if (slugConflict) return NextResponse.json({ error:'Slug already exists' }, { status:409 });

    const game = await prisma.$transaction(async (tx) => {
      await tx.screenshot.deleteMany({ where:{ gameId:id } });
      await tx.video.deleteMany({ where:{ gameId:id } });
      return tx.game.update({
        where:{ id },
        data:{
          title:data.title, slug:data.slug, description:data.description, tag:data.tag,
          categories:data.categories, tech:data.tech, year:data.year, emoji:data.emoji,
          bgColor:data.bgColor, coverImageUrl:data.coverImageUrl, published:data.published,
          sortOrder:data.sortOrder, portfolioSection:data.portfolioSection, projectContext:data.projectContext,
          screenshots:{ create:data.screenshots.filter((item) => item.url) },
          videos:{ create:data.videos.filter((item) => item.youtubeUrl) },
        },
        include:gameInclude,
      });
    });
    return NextResponse.json(game);
  } catch (error) {
    console.error('PUT /api/games/[id] error:', error);
    const message = error.message?.includes('Missing required') ? error.message : 'Failed to update project';
    return NextResponse.json({ error:message }, { status:400 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await requireAuth();
    if (!session) return NextResponse.json({ error:'Unauthorized' }, { status:401 });
    const { id } = await params;

    if (isDemo) {
      const deleted = await deleteDemoProject(id);
      return deleted ? NextResponse.json({ success:true }) : NextResponse.json({ error:'Project not found' }, { status:404 });
    }

    const existing = await prisma.game.findUnique({ where:{ id } });
    if (!existing) return NextResponse.json({ error:'Project not found' }, { status:404 });
    await prisma.game.delete({ where:{ id } });
    return NextResponse.json({ success:true });
  } catch (error) {
    console.error('DELETE /api/games/[id] error:', error);
    return NextResponse.json({ error:'Failed to delete project' }, { status:500 });
  }
}
