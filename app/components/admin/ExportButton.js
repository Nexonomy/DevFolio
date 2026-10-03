'use client';

import { useState } from 'react';

export default function ExportButton({ className = 'admin-button admin-button-primary', label = 'Download portfolio content' }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const download = async () => {
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      const response = await fetch('/api/admin/export', { cache: 'no-store' });
      if (!response.ok) {
        throw new Error(`Export failed (${response.status})`);
      }
      const blob = await response.blob();
      const disposition = response.headers.get('content-disposition') || '';
      const match = disposition.match(/filename="([^"]+)"/);
      const stamp = new Date().toISOString().replace(/[:T]/g, '-').slice(0, 19);
      const filename = match ? match[1] : `devfolio-portfolio-${stamp}.json`;

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (reason) {
      setError(reason.message || 'Download failed.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <button type="button" className={className} onClick={download} disabled={busy}>
        <span aria-hidden="true">↓</span> {busy ? 'Preparing…' : label}
      </button>
      {error ? <p role="alert" style={{ color: '#ff6b6b', fontSize: '13px', marginTop: '8px' }}>{error}</p> : null}
    </>
  );
}
