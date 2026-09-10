import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/api-auth';
import { gameInclude, parseGameBody } from '@/lib/games';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const session = await requireAuth();
    const { searchParams } = new URL(request.url);
    const adminView = searchParams.get('admin') === 'true' && session;

    const game = await prisma.game.findUnique({
      where: { id },
      include: gameInclude,
    });

    if (!game || (!adminView && !game.published)) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    return NextResponse.json(game);
  } catch (error) {
    console.error('GET /api/games/[id] error:', error);
    return NextResponse.json({ error: 'Failed to fetch game' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const session = await requireAuth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const data = parseGameBody(body);

    const existing = await prisma.game.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    const slugConflict = await prisma.game.findFirst({
      where: { slug: data.slug, NOT: { id } },
    });
    if (slugConflict) {
      return NextResponse.json({ error: 'Slug already exists' }, { status: 409 });
    }

    const game = await prisma.$transaction(async (tx) => {
      await tx.screenshot.deleteMany({ where: { gameId: id } });
      await tx.video.deleteMany({ where: { gameId: id } });

      return tx.game.update({
        where: { id },
        data: {
          title: data.title,
          slug: data.slug,
          description: data.description,
          tag: data.tag,
          tech: data.tech,
          year: data.year,
          emoji: data.emoji,
          bgColor: data.bgColor,
          coverImageUrl: data.coverImageUrl,
          published: data.published,
          sortOrder: data.sortOrder,
          portfolioSection: data.portfolioSection,
          projectContext: data.projectContext,
          screenshots: {
            create: data.screenshots.filter((s) => s.url),
          },
          videos: {
            create: data.videos.filter((v) => v.youtubeUrl),
          },
        },
        include: gameInclude,
      });
    });

    return NextResponse.json(game);
  } catch (error) {
    console.error('PUT /api/games/[id] error:', error);
    const message = error.message?.includes('Missing required')
      ? error.message
      : 'Failed to update game';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await requireAuth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const existing = await prisma.game.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    await prisma.game.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/games/[id] error:', error);
    return NextResponse.json({ error: 'Failed to delete game' }, { status: 500 });
  }
}
