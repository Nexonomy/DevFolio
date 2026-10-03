import { redirect } from 'next/navigation';
import Link from 'next/link';
import { requireAuth } from '@/lib/api-auth';

export const dynamic = 'force-dynamic';

const VERCEL_PROJECT = 'nexs-projects-aa2f4c4a/devfolio';

export default async function AdminAnalyticsPage() {
  const session = await requireAuth();
  if (!session) redirect('/admin/login');

  const analyticsUrl = `https://vercel.com/${VERCEL_PROJECT}/analytics`;
  const speedUrl = `https://vercel.com/${VERCEL_PROJECT}/speed-insights`;

  return (
    <div className="admin-page admin-dashboard">
      <section className="admin-dashboard-hero">
        <div>
          <p className="admin-kicker">Portfolio analytics</p>
          <h1 className="admin-title">Who&rsquo;s visiting.</h1>
          <p className="admin-subtitle">Page views, top pages, referrers, countries, and device breakdowns live on your Vercel dashboard. No self-hosted store, no gaps, no cold-start loss.</p>
        </div>
      </section>

      <div style={{ display: 'grid', gap: '18px', marginTop: '28px', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
        <article style={{ padding: '22px 24px', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px' }}>
          <h2 style={{ margin: '0 0 10px', fontSize: '15px', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Web Analytics</h2>
          <p style={{ margin: '0 0 16px', opacity: 0.75, fontSize: '14px' }}>Visits, unique visitors, top pages, referrers, countries. Updates in near-real-time.</p>
          <Link href={analyticsUrl} target="_blank" rel="noreferrer" className="admin-button admin-button-primary">
            Open in Vercel <span aria-hidden="true">↗</span>
          </Link>
        </article>

        <article style={{ padding: '22px 24px', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px' }}>
          <h2 style={{ margin: '0 0 10px', fontSize: '15px', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Speed Insights</h2>
          <p style={{ margin: '0 0 16px', opacity: 0.75, fontSize: '14px' }}>Real-user Core Web Vitals — LCP, INP, CLS — scored per page. Enable it to see what recruiters&rsquo; devices actually experience.</p>
          <Link href={speedUrl} target="_blank" rel="noreferrer" className="admin-button">
            Open in Vercel <span aria-hidden="true">↗</span>
          </Link>
        </article>
      </div>

      <section style={{ marginTop: '32px', padding: '20px 24px', border: '1px dashed rgba(255,255,255,0.12)', borderRadius: '12px', opacity: 0.85 }}>
        <h3 style={{ margin: '0 0 8px', fontSize: '13px', letterSpacing: '0.08em', textTransform: 'uppercase', opacity: 0.7 }}>One-time setup</h3>
        <ol style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', lineHeight: 1.6 }}>
          <li>Open the Vercel project &rarr; <strong>Analytics</strong> tab &rarr; click <strong>Enable</strong>.</li>
          <li>Hobby plan includes 2,500 events / month free &mdash; plenty for a portfolio.</li>
          <li>Data begins appearing within a minute of the first visit after enabling.</li>
        </ol>
      </section>
    </div>
  );
}
