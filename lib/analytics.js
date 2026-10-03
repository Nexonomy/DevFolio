import 'server-only';

import { createHash } from 'node:crypto';
import { mkdir, readFile, appendFile } from 'node:fs/promises';
import path from 'node:path';
import { prisma } from './prisma';

const LOG_DIR = path.join(process.cwd(), '.analytics');
const LOG_FILE = path.join(LOG_DIR, 'visits.jsonl');

function hashString(value) {
  if (!value) return null;
  return createHash('sha256').update(String(value)).digest('hex').slice(0, 16);
}

function usePrisma() {
  return process.env.PORTFOLIO_DEMO !== 'true' && Boolean(process.env.DATABASE_URL);
}

export async function recordVisit({ path: visitPath, referrer, userAgent, country, ip }) {
  const entry = {
    path: visitPath || '/',
    referrer: referrer || null,
    userAgent: userAgent || null,
    country: country || null,
    visitorHash: hashString(`${ip || ''}|${new Date().toISOString().slice(0, 10)}|${userAgent || ''}`),
    at: new Date().toISOString(),
  };

  if (usePrisma()) {
    try {
      // Visit model is optional; if the schema doesn't include it, fall through to file.
      if (prisma.visit?.create) {
        await prisma.visit.create({
          data: {
            path: entry.path,
            referrer: entry.referrer,
            userAgent: entry.userAgent,
            country: entry.country,
            visitorHash: entry.visitorHash,
            createdAt: new Date(entry.at),
          },
        });
        return;
      }
    } catch (error) {
      console.warn('[analytics] prisma write failed, falling back to file:', error.message);
    }
  }

  try {
    await mkdir(LOG_DIR, { recursive: true });
    await appendFile(LOG_FILE, `${JSON.stringify(entry)}\n`, 'utf8');
  } catch (error) {
    console.error('[analytics] file write failed:', error);
  }
}

export async function readVisits({ limit = 500 } = {}) {
  if (usePrisma() && prisma.visit?.findMany) {
    try {
      const rows = await prisma.visit.findMany({ orderBy: { createdAt: 'desc' }, take: limit });
      return rows.map((row) => ({
        path: row.path,
        referrer: row.referrer,
        userAgent: row.userAgent,
        country: row.country,
        visitorHash: row.visitorHash,
        at: row.createdAt.toISOString(),
      }));
    } catch (error) {
      console.warn('[analytics] prisma read failed, falling back to file:', error.message);
    }
  }

  try {
    const text = await readFile(LOG_FILE, 'utf8');
    const lines = text.split('\n').filter(Boolean);
    const tail = lines.slice(-limit).reverse();
    return tail.map((line) => {
      try { return JSON.parse(line); } catch { return null; }
    }).filter(Boolean);
  } catch (error) {
    if (error.code === 'ENOENT') return [];
    throw error;
  }
}

export function summarise(visits) {
  const total = visits.length;
  const uniqueVisitors = new Set(visits.map((visit) => visit.visitorHash).filter(Boolean)).size;
  const now = Date.now();
  const dayAgo = now - 24 * 60 * 60 * 1000;
  const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
  const last24h = visits.filter((visit) => new Date(visit.at).getTime() >= dayAgo).length;
  const last7d = visits.filter((visit) => new Date(visit.at).getTime() >= weekAgo).length;

  const byPath = new Map();
  const byReferrer = new Map();
  const byCountry = new Map();
  for (const visit of visits) {
    byPath.set(visit.path, (byPath.get(visit.path) || 0) + 1);
    const ref = visit.referrer ? safeOrigin(visit.referrer) : 'direct';
    byReferrer.set(ref, (byReferrer.get(ref) || 0) + 1);
    if (visit.country) byCountry.set(visit.country, (byCountry.get(visit.country) || 0) + 1);
  }

  return {
    total,
    uniqueVisitors,
    last24h,
    last7d,
    topPaths: topEntries(byPath),
    topReferrers: topEntries(byReferrer),
    topCountries: topEntries(byCountry),
  };
}

function topEntries(map, limit = 8) {
  return [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit).map(([key, count]) => ({ key, count }));
}

function safeOrigin(value) {
  try { return new URL(value).hostname || 'direct'; } catch { return value.slice(0, 80); }
}
