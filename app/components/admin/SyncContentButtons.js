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
      <SyncButton scope="profile" label="Sync profile from source" className="admin-button admin-button-primary" />
      <SyncButton scope="projects" label="Sync all 10 projects" />
      <p style={{ margin: 0, opacity: 0.6, fontSize: '12px' }}>
        Warning: syncing the profile replaces everything you edited in Profile &amp; Content with the copy in the codebase. Only use it to reset. Project sync updates the 10 seeded projects by slug and deletes nothing.
      </p>
    </div>
  );
}
