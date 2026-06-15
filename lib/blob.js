export function getBlobDeliveryUrl(urlOrPathname) {
  if (!urlOrPathname) return null;

  if (urlOrPathname.startsWith('/api/blob?')) {
    return urlOrPathname;
  }

  if (!urlOrPathname.startsWith('http')) {
    return `/api/blob?pathname=${encodeURIComponent(urlOrPathname)}`;
  }

  try {
    const url = new URL(urlOrPathname);
    if (url.hostname.includes('blob.vercel-storage.com')) {
      const pathname = url.pathname.replace(/^\//, '');
      return `/api/blob?pathname=${encodeURIComponent(pathname)}`;
    }
  } catch {
    return urlOrPathname;
  }

  return urlOrPathname;
}
