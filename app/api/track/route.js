import { NextResponse } from 'next/server';
import { recordVisit } from '@/lib/analytics';
import { rateLimit } from '@/lib/rate-limit';

export const runtime = 'nodejs';

export async function POST(request) {
  const limit = rateLimit(request, { key: 'track', windowMs: 60_000, max: 30 });
  if (!limit.ok) {
    return NextResponse.json({ ok: true, skipped: true }, { status: 200 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const path = typeof body.path === 'string' ? body.path.slice(0, 500) : '/';
    const referrer = typeof body.referrer === 'string' ? body.referrer.slice(0, 500) : null;

    if (path.startsWith('/admin') || path.startsWith('/api')) {
      return NextResponse.json({ ok: true, skipped: true });
    }

    const headers = request.headers;
    if (headers.get('dnt') === '1' || headers.get('sec-gpc') === '1') {
      return NextResponse.json({ ok: true, skipped: true });
    }

    const userAgent = (headers.get('user-agent') || '').slice(0, 500);
    if (/bot|crawl|spider|preview|slurp|fetch|monitor/i.test(userAgent)) {
      return NextResponse.json({ ok: true, skipped: true });
    }

    const forwarded = headers.get('x-forwarded-for') || '';
    const ip = forwarded.split(',')[0].trim() || headers.get('x-real-ip') || '';
    const country = headers.get('x-vercel-ip-country') || null;

    await recordVisit({ path, referrer, userAgent, country, ip });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('POST /api/track error:', error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
