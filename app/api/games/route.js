import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/api-auth';
import { gameInclude, parseGameBody } from '@/lib/games';

export async function GET(request) {
  try {
    const session = await requireAuth();
    const { searchParams } = new URL(request.url);
    const adminView = searchParams.get('admin') === 'true' && session;

    const games = await prisma.game.findMany({
      where: adminView ? undefined : { published: true },
      include: gameInclude,
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    });

    return NextResponse.json(games);
  } catch (error) {
    console.error('GET /api/games error:', error);
    return NextResponse.json({ error: 'Failed to fetch games' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await requireAuth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const data = parseGameBody(body);

    const existing = await prisma.game.findUnique({ where: { slug: data.slug } });
    if (existing) {
      return NextResponse.json({ error: 'Slug already exists' }, { status: 409 });
    }

    const game = await prisma.game.create({
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
        screenshots: {
          create: data.screenshots.filter((s) => s.url),
        },
        videos: {
          create: data.videos.filter((v) => v.youtubeUrl),
        },
      },
      include: gameInclude,
    });

    return NextResponse.json(game, { status: 201 });
  } catch (error) {
    console.error('POST /api/games error:', error);
    const message = error.message?.includes('Missing required')
      ? error.message
      : 'Failed to create game';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
