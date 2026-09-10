import { head } from '@vercel/blob';

function extractPathname(urlOrPathname) {
  if (!urlOrPathname) return null;

  if (urlOrPathname.startsWith('/api/blob?')) {
    return new URL(urlOrPathname, 'http://localhost').searchParams.get('pathname');
  }

  if (!urlOrPathname.startsWith('http')) {
    return urlOrPathname;
  }

  try {
    const url = new URL(urlOrPathname);
    if (url.hostname.includes('blob.vercel-storage.com')) {
      return url.pathname.replace(/^\//, '');
    }
  } catch {
    return null;
  }

  return null;
}

export function getBlobDeliveryUrl(urlOrPathname) {
  if (!urlOrPathname) return null;

  if (urlOrPathname.startsWith('http')) {
    return urlOrPathname;
  }

  if (urlOrPathname.startsWith('/api/blob?')) {
    return urlOrPathname;
  }

  return `/api/blob?pathname=${encodeURIComponent(urlOrPathname)}`;
}

export async function resolveBlobUrl(urlOrPathname) {
  if (!urlOrPathname) return null;

  if (urlOrPathname.startsWith('http')) {
    return urlOrPathname;
  }

  const pathname = extractPathname(urlOrPathname);
  if (!pathname) {
    return getBlobDeliveryUrl(urlOrPathname);
  }

  try {
    const meta = await head(pathname, {
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
    return meta.url;
  } catch (error) {
    console.error('Failed to resolve blob URL:', pathname, error);
    return getBlobDeliveryUrl(urlOrPathname);
  }
}

export async function resolveGameMediaUrls(game) {
  const coverImageUrl = await resolveBlobUrl(game.coverImageUrl);

  const screenshots = game.screenshots
    ? await Promise.all(
        game.screenshots.map(async (screenshot) => ({
          ...screenshot,
          url: await resolveBlobUrl(screenshot.url),
        }))
      )
    : game.screenshots;

  return {
    ...game,
    coverImageUrl,
    screenshots,
  };
}
