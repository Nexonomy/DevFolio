'use client';

import { useState } from 'react';

function friendly(summary) {
  const parts = [];
  if (summary?.profile?.ok) {
    parts.push(`Profile synced (${summary.profile.experiences ?? '?'} experiences).`);
  }
  if (summary?.projects?.ok) {
    const created = summary.projects.details?.filter((p) => p.action === 'created').length ?? 0;
    const updated = summary.projects.details?.filter((p) => p.action === 'updated').length ?? 0;
    parts.push(`${summary.projects.count} projects synced — ${created} created, ${updated} updated.`);
  }
  if (summary?.caseStudies?.ok) {
    parts.push(summary.caseStudies.projects
      ? `Filled empty case-study fields on ${summary.caseStudies.projects} project${summary.caseStudies.projects === 1 ? '' : 's'}.`
      : 'Every case study already has content; nothing changed.');
  }
  return parts.join(' ');
}

function SyncButton({ scope, label, className = 'admin-button' }) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const run = async () => {
    if (busy) return;
    setBusy(true);
    setMessage('');
    setError('');
    try {
      const response = await fetch('/api/admin/sync-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scope }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || result.ok === false) {
        setError(result.error || `Sync failed (${response.status})`);
      } else {
        setMessage(friendly(result.summary) || 'Done.');
      }
    } catch (reason) {
      setError(reason.message || 'Sync failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <button type="button" className={className} onClick={run} disabled={busy}>
        <span aria-hidden="true">↻</span> {busy ? 'Syncing…' : label}
      </button>
      {message ? (
        <p style={{ color: '#68d391', fontSize: '13px', marginTop: '8px', margin: '8px 0 0' }}>{message}</p>
      ) : null}
      {error ? (
        <p role="alert" style={{ color: '#ff6b6b', fontSize: '13px', marginTop: '8px', margin: '8px 0 0' }}>{error}</p>
      ) : null}
    </div>
  );
}

export default function SyncContentButtons() {
  return (
    <div style={{ display: 'grid', gap: '14px' }}>
      <SyncButton scope="case-studies" label="Fill project case studies (safe)" className="admin-button admin-button-primary" />
      <SyncButton scope="profile" label="Reset profile from source" />
      <SyncButton scope="projects" label="Sync all 10 projects" />
      <p style={{ margin: 0, opacity: 0.6, fontSize: '12px' }}>
        “Fill project case studies” only writes into empty fields (role, contribution, features…) for the 10 master-doc projects, so it never overwrites your edits. “Reset profile” replaces everything in Profile &amp; Content with the codebase copy, so only use it to start over. Project sync overwrites the 10 seeded projects’ core details by slug and deletes nothing.
      </p>
    </div>
  );
}
