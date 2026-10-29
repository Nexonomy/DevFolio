const pathIdRoutes = ['/embed/', '/shorts/', '/live/'];

export function extractYouTubeId(url) {
  if (!url) return null;

  try {
    const parsed = new URL(url);

    if (parsed.hostname.includes('youtu.be')) {
      return parsed.pathname.slice(1).split('/')[0] || null;
    }

    if (parsed.hostname.includes('youtube.com')) {
      // Embeds, Shorts and live permalinks all carry the id in the path instead of ?v=.
      if (pathIdRoutes.some((route) => parsed.pathname.startsWith(route))) {
        return parsed.pathname.split('/')[2] || null;
      }

      return parsed.searchParams.get('v');
    }
  } catch {
    return null;
  }

  return null;
}
