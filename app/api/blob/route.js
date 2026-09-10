import { NextResponse } from 'next/server';
import { get } from '@vercel/blob';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const pathname = searchParams.get('pathname');

    if (!pathname) {
      return NextResponse.json({ error: 'Missing pathname' }, { status: 400 });
    }

    const result = await get(pathname, {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    if (!result) {
      return new NextResponse('Not found', { status: 404 });
    }

    return new NextResponse(result.stream, {
      headers: {
        'Content-Type': result.blob.contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('GET /api/blob error:', error);
    return new NextResponse('Failed to load image', { status: 500 });
  }
}
