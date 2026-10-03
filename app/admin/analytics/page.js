import { redirect } from 'next/navigation';
import { requireAuth } from '@/lib/api-auth';
import { readVisits, summarise } from '@/lib/analytics';

export const dynamic = 'force-dynamic';

function formatUA(ua) {
  if (!ua) return 'Unknown client';
  if (/iPhone|iPad/.test(ua)) return 'iOS';
  if (/Android/.test(ua)) return 'Android';
  if (/Edg\//.test(ua)) return 'Edge';
  if (/Firefox/.test(ua)) return 'Firefox';
  if (/Chrome/.test(ua)) return 'Chrome';
  if (/Safari/.test(ua)) return 'Safari';
  return ua.slice(0, 48);
}

function relative(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default async function AdminAnalyticsPage() {
  const session = await requireAuth();
  if (!session) redirect('/admin/login');

  const visits = await readVisits({ limit: 1000 });
  const stats = summarise(visits);
  const recent = visits.slice(0, 25);

  return (
    <div className="admin-page admin-dashboard">
      <section className="admin-dashboard-hero">
        <div>
          <p className="admin-kicker">Portfolio analytics</p>
          <h1 className="admin-title">Who&rsquo;s visiting.</h1>
          <p className="admin-subtitle">Lightweight, self-hosted page views. Bots and admin visits are ignored. Visitors can opt out with Do Not Track.</p>
        </div>
      </section>

      <div className="admin-stats" aria-label="Visit summary">
        <article><span>Total visits</span><strong>{String(stats.total).padStart(2, '0')}</strong><i>Lifetime recorded</i></article>
        <article><span>Unique visitors</span><strong>{String(stats.uniqueVisitors).padStart(2, '0')}</strong><i>Daily hashed</i></article>
        <article><span>Last 24 hours</span><strong>{String(stats.last24h).padStart(2, '0')}</strong><i>Recent activity</i></article>
        <article><span>Last 7 days</span><strong>{String(stats.last7d).padStart(2, '0')}</strong><i>Weekly reach</i></article>
      </div>

      <div style={{ display: 'grid', gap: '24px', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', marginTop: '32px' }}>
        <AnalyticsBlock title="Top pages" rows={stats.topPaths} empty="No visits yet." />
        <AnalyticsBlock title="Top referrers" rows={stats.topReferrers} empty="No referrers yet." />
        <AnalyticsBlock title="Top countries" rows={stats.topCountries} empty="No country data yet (available when deployed on Vercel)." />
      </div>

      <section style={{ marginTop: '32px' }}>
        <h2 style={{ marginBottom: '12px' }}>Recent visits</h2>
        {recent.length === 0 ? (
          <p style={{ opacity: 0.7 }}>No visits recorded yet. Open the public site in another tab to generate one.</p>
        ) : (
          <ol style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '8px' }}>
            {recent.map((visit, index) => (
              <li
                key={`${visit.at}-${index}`}
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'minmax(80px,auto) 1fr minmax(90px,auto) minmax(80px,auto)',
                  gap: '12px',
                  alignItems: 'center',
                  padding: '10px 14px',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '8px',
                  fontSize: '13px',
                }}
              >
                <time dateTime={visit.at} style={{ opacity: 0.6 }}>{relative(visit.at)}</time>
                <span style={{ fontFamily: 'monospace' }}>{visit.path}</span>
                <span style={{ opacity: 0.7 }}>{visit.country || '—'}</span>
                <span style={{ opacity: 0.6 }}>{formatUA(visit.userAgent)}</span>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}

function AnalyticsBlock({ title, rows, empty }) {
  return (
    <article style={{ padding: '18px 20px', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px' }}>
      <h3 style={{ margin: '0 0 12px', fontSize: '14px', letterSpacing: '0.04em', textTransform: 'uppercase', opacity: 0.75 }}>{title}</h3>
      {rows.length === 0 ? (
        <p style={{ opacity: 0.6, fontSize: '13px', margin: 0 }}>{empty}</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '6px' }}>
          {rows.map((row) => (
            <li key={row.key} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
              <span style={{ fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={row.key}>{row.key}</span>
              <strong>{row.count}</strong>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}
