'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function AnalyticsPing() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || pathname.startsWith('/admin')) return;
    if (navigator.doNotTrack === '1' || window.doNotTrack === '1') return;

    const timer = window.setTimeout(() => {
      try {
        fetch('/api/track', {
          method: 'POST',
          keepalive: true,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path: pathname, referrer: document.referrer || null }),
        }).catch(() => {});
      } catch {}
    }, 400);

    return () => window.clearTimeout(timer);
  }, [pathname]);

  return null;
}
