export const gameInclude = {
  screenshots: { orderBy: { sortOrder: 'asc' } },
  videos: { orderBy: { sortOrder: 'asc' } },
};

export function parseGameBody(body) {
  const {
    title,
    slug,
    description,
    tag,
    tech,
    year,
    emoji,
    bgColor,
    coverImageUrl,
    published,
    sortOrder,
    screenshots = [],
    videos = [],
  } = body;

  if (!title?.trim() || !slug?.trim() || !description?.trim() || !tag?.trim() || !tech?.trim()) {
    throw new Error('Missing required fields: title, slug, description, tag, tech');
  }

  return {
    title: title.trim(),
    slug: slug.trim(),
    description: description.trim(),
    tag: tag.trim(),
    tech: tech.trim(),
    year: year?.trim() || null,
    emoji: emoji?.trim() || null,
    bgColor: bgColor?.trim() || '#4A7C2F',
    coverImageUrl: coverImageUrl?.trim() || null,
    published: Boolean(published),
    sortOrder: Number.isFinite(Number(sortOrder)) ? Number(sortOrder) : 0,
    screenshots: screenshots.map((item, index) => ({
      url: item.url,
      alt: item.alt?.trim() || null,
      sortOrder: Number.isFinite(Number(item.sortOrder)) ? Number(item.sortOrder) : index,
    })),
    videos: videos.map((item, index) => ({
      youtubeUrl: item.youtubeUrl?.trim(),
      title: item.title?.trim() || null,
      sortOrder: Number.isFinite(Number(item.sortOrder)) ? Number(item.sortOrder) : index,
    })),
  };
}
