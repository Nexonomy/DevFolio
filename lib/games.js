export const gameInclude = {
  screenshots: { orderBy: { sortOrder: 'asc' } },
  videos: { orderBy: { sortOrder: 'asc' } },
};

export const GAME_GENRES = [
  'Action', 'Adventure', 'Arcade', 'AR / VR', 'Casual', 'Hybrid-Casual', 'Hyper-Casual',
  'FPS / Shooter', 'Multiplayer', 'Platformer', 'Puzzle', 'Racing', 'Roguelike', 'RPG',
  'Simulation', 'Sports', 'Strategy', 'Survival', 'Tools & Tech',
];

export const CASE_STUDY_FIELDS = ['role', 'contribution', 'contributions', 'team', 'recognition', 'features', 'highlights', 'platforms', 'liveUrl'];

const lines = (value) => (Array.isArray(value) ? value : String(value ?? '').split('\n'))
  .map((item) => String(item).trim().replace(/^[-•*]\s*/, ''))
  .filter(Boolean)
  .slice(0, 20);

const optionalText = (value) => String(value ?? '').trim() || null;

function parseCaseStudy(body) {
  const liveUrl = optionalText(body.liveUrl);
  return {
    role: optionalText(body.role),
    contribution: optionalText(body.contribution),
    contributions: lines(body.contributions),
    team: lines(body.team),
    recognition: optionalText(body.recognition),
    features: lines(body.features),
    highlights: lines(body.highlights),
    platforms: optionalText(body.platforms),
    liveUrl: liveUrl && /^https:\/\//i.test(liveUrl) ? liveUrl : null,
  };
}

export function pickCaseStudy(data) {
  return Object.fromEntries(CASE_STUDY_FIELDS.map((field) => [field, data[field]]));
}

export function parseGameBody(body) {
  const {
    title,
    slug,
    description,
    tag,
    categories = [],
    tech,
    year,
    emoji,
    bgColor,
    coverImageUrl,
    published,
    sortOrder,
    portfolioSection,
    projectContext,
    screenshots = [],
    videos = [],
  } = body;

  if (!title?.trim() || !slug?.trim() || !description?.trim() || !tag?.trim() || !tech?.trim()) {
    throw new Error('Missing required fields: title, slug, description, tag, tech');
  }

  const normalizedCategories = [...new Map(
    (Array.isArray(categories) ? categories : String(categories).split(','))
      .map((category) => String(category).trim())
      .filter(Boolean)
      .map((category) => [category.toLocaleLowerCase(), category]),
  ).values()];

  return {
    title: title.trim(),
    slug: slug.trim(),
    description: description.trim(),
    tag: tag.trim(),
    categories: normalizedCategories.length ? normalizedCategories : [tag.trim()],
    tech: tech.trim(),
    year: year?.trim() || null,
    emoji: emoji?.trim() || null,
    bgColor: bgColor?.trim() || '#4A7C2F',
    coverImageUrl: coverImageUrl?.trim() || null,
    published: Boolean(published),
    sortOrder: Number.isFinite(Number(sortOrder)) ? Number(sortOrder) : 0,
    portfolioSection: ['GAME', 'OTHER'].includes(portfolioSection) ? portfolioSection : 'GAME',
    projectContext: ['PERSONAL', 'COMPANY', 'ACADEMIC', 'HACKATHON'].includes(projectContext) ? projectContext : 'PERSONAL',
    ...parseCaseStudy(body),
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
