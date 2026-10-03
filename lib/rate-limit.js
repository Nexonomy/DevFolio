import 'server-only';

// In-memory token bucket. Works per server instance; good for a single Vercel
// region or local dev. For a production-grade limiter across many instances,
// swap this for Upstash Ratelimit or similar. Even a soft, per-instance limit
// is far better than none — it blunts the obvious scripted abuse.
const buckets = new Map();

function clientKey(request) {
  const headers = request.headers;
  const forwarded = headers.get('x-forwarded-for') || '';
  const ip = forwarded.split(',')[0].trim() || headers.get('x-real-ip') || 'unknown';
  return ip;
}

export function rateLimit(request, { key, windowMs, max }) {
  const now = Date.now();
  const bucketKey = `${key}:${clientKey(request)}`;
  const entry = buckets.get(bucketKey);

  if (!entry || entry.resetAt <= now) {
    buckets.set(bucketKey, { count: 1, resetAt: now + windowMs });
    cleanup(now);
    return { ok: true, remaining: max - 1, resetAt: now + windowMs };
  }

  if (entry.count >= max) {
    return { ok: false, remaining: 0, resetAt: entry.resetAt, retryAfter: Math.max(1, Math.ceil((entry.resetAt - now) / 1000)) };
  }

  entry.count += 1;
  return { ok: true, remaining: max - entry.count, resetAt: entry.resetAt };
}

function cleanup(now) {
  if (buckets.size < 500) return;
  for (const [key, entry] of buckets) {
    if (entry.resetAt <= now) buckets.delete(key);
  }
}
