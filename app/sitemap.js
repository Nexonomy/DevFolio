import { getPublishedGames } from '@/lib/portfolio';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ahsanhere.me';

export default async function sitemap() {
  const now = new Date();
  const base = [
    { url: `${siteUrl}/`, lastModified: now, changeFrequency: 'weekly', priority: 1 },
  ];

  let projects = [];
  try {
    projects = await getPublishedGames();
  } catch {
    projects = [];
  }

  const projectEntries = projects
    .filter((project) => project?.slug)
    .map((project) => {
      const section = (project.portfolioSection || 'GAME') === 'OTHER' ? 'projects' : 'games';
      return {
        url: `${siteUrl}/${section}/${project.slug}`,
        lastModified: project.updatedAt ? new Date(project.updatedAt) : now,
        changeFrequency: 'monthly',
        priority: 0.8,
      };
    });

  return [...base, ...projectEntries];
}
