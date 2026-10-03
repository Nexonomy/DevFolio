import { redirect } from 'next/navigation';
import { requireAuth } from '@/lib/api-auth';
import { getProfile } from '@/lib/profile';
import { isDemo } from '@/lib/portfolio';
import ExportButton from '@/app/components/admin/ExportButton';

export const dynamic = 'force-dynamic';

function statusBadge(ok, labelOk = 'Connected', labelOff = 'Not configured') {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '3px 10px',
        borderRadius: '999px',
        fontSize: '12px',
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        background: ok ? 'rgba(104,211,145,0.12)' : 'rgba(255,170,120,0.12)',
        color: ok ? '#68d391' : '#ffb380',
        border: `1px solid ${ok ? 'rgba(104,211,145,0.35)' : 'rgba(255,170,120,0.35)'}`,
      }}
    >
      <i style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor' }} aria-hidden="true" /> {ok ? labelOk : labelOff}
    </span>
  );
}

function Row({ title, status, children }) {
  return (
    <article
      style={{
        display: 'grid',
        gap: '12px',
        padding: '20px 22px',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '12px',
      }}
    >
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
        <h3 style={{ margin: 0, fontSize: '15px', letterSpacing: '0.04em', textTransform: 'uppercase' }}>{title}</h3>
        {status}
      </header>
      <div style={{ display: 'grid', gap: '8px', fontSize: '14px', opacity: 0.85 }}>{children}</div>
    </article>
  );
}

function KeyValue({ label, value, mono = false }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
      <span style={{ opacity: 0.65 }}>{label}</span>
      <span style={{ fontFamily: mono ? 'ui-monospace, SFMono-Regular, Menlo, monospace' : 'inherit', textAlign: 'right', wordBreak: 'break-all' }}>{value}</span>
    </div>
  );
}

export default async function AdminIntegrationsPage() {
  const session = await requireAuth();
  if (!session) redirect('/admin/login');

  const profile = await getProfile();

  const resendConfigured = Boolean(process.env.RESEND_API_KEY);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ahsanhere.me';
  const contactFrom = process.env.CONTACT_FROM_EMAIL || (resendConfigured ? 'Portfolio <onboarding@resend.dev>' : '— (fallback to mailto)');
  const databaseConfigured = Boolean(process.env.DATABASE_URL);
  const blobConfigured = Boolean(process.env.BLOB_READ_WRITE_TOKEN);
  const authConfigured = Boolean(process.env.NEXTAUTH_SECRET) && Boolean(process.env.ADMIN_PASSWORD);

  return (
    <div className="admin-page admin-dashboard">
      <section className="admin-dashboard-hero">
        <div>
          <p className="admin-kicker">Operations</p>
          <h1 className="admin-title">Integrations &amp; backups.</h1>
          <p className="admin-subtitle">Everything that keeps the public site working but has no place to live on it: email delivery, analytics source, storage, auth, and portfolio export.</p>
        </div>
        <ExportButton className="admin-button admin-button-primary" />
      </section>

      {isDemo && (
        <div className="admin-preview-notice">
          <strong>Local studio mode</strong>
          <span>Values below reflect your current environment. Production values live in your Vercel project settings.</span>
        </div>
      )}

      <div style={{ display: 'grid', gap: '18px', marginTop: '24px' }}>
        <Row title="Contact email delivery (Resend)" status={statusBadge(resendConfigured, 'Live', 'Falls back to mailto')}>
          <KeyValue label="Messages delivered to" value={profile.email || '— (set in Profile)'} mono />
          <KeyValue label="From address" value={contactFrom} mono />
          <KeyValue label="API key" value={resendConfigured ? '•••• configured' : 'RESEND_API_KEY not set'} />
          <p style={{ margin: '8px 0 0', opacity: 0.7, fontSize: '13px' }}>
            Sign up at resend.com, create an API key, add it as <code>RESEND_API_KEY</code> in Vercel env vars, then redeploy. Verify <code>ahsanhere.me</code> under Domains so the From address becomes <code>portfolio@ahsanhere.me</code>.
          </p>
        </Row>

        <Row title="Analytics" status={statusBadge(true, databaseConfigured ? 'Postgres' : 'File log')}>
          <KeyValue label="Backend" value={databaseConfigured ? 'Prisma (requires Visit model)' : '.analytics/visits.jsonl (file)'} mono />
          <KeyValue label="Admin view" value="/admin/analytics" mono />
          <p style={{ margin: '8px 0 0', opacity: 0.7, fontSize: '13px' }}>
            Bot traffic, Do Not Track, and admin pages are filtered. Country data appears automatically when deployed on Vercel.
          </p>
        </Row>

        <Row title="Site URL &amp; SEO" status={statusBadge(Boolean(process.env.NEXT_PUBLIC_SITE_URL), 'Set', 'Using default')}>
          <KeyValue label="Public URL" value={siteUrl} mono />
          <KeyValue label="Sitemap" value={`${siteUrl}/sitemap.xml`} mono />
          <KeyValue label="Robots" value={`${siteUrl}/robots.txt`} mono />
        </Row>

        <Row title="Database" status={statusBadge(databaseConfigured, 'Connected', 'Demo mode')}>
          <KeyValue label="DATABASE_URL" value={databaseConfigured ? '•••• configured' : 'Not set — using .demo-data/projects.json'} />
          <KeyValue label="Mode" value={isDemo ? 'PORTFOLIO_DEMO=true' : 'Production'} mono />
        </Row>

        <Row title="Media storage (Vercel Blob)" status={statusBadge(blobConfigured, 'Connected', 'Local uploads')}>
          <KeyValue label="BLOB_READ_WRITE_TOKEN" value={blobConfigured ? '•••• configured' : 'Not set — uploads go to public/demo-uploads'} />
        </Row>

        <Row title="Admin authentication" status={statusBadge(authConfigured, 'Secured', 'Preview password')}>
          <KeyValue label="NEXTAUTH_SECRET" value={process.env.NEXTAUTH_SECRET ? '•••• configured' : 'Not set'} />
          <KeyValue label="ADMIN_PASSWORD" value={process.env.ADMIN_PASSWORD ? '•••• configured' : 'preview (demo only)'} />
        </Row>

        <Row title="Portfolio backup" status={statusBadge(true, 'Available')}>
          <p style={{ margin: 0, opacity: 0.75, fontSize: '13px' }}>
            Downloads a single JSON file with your profile, every game, every other project, screenshots, videos, and categories — the complete state the public site renders from.
          </p>
          <ExportButton className="admin-button" />
        </Row>
      </div>
    </div>
  );
}
