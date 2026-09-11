import { cache } from 'react';
import { prisma } from './prisma';
import { gameInclude } from './games';
import { resolveGameMediaUrls } from './blob';
import { readDemoProjects } from './demo-store';

export const isDemo = process.env.PORTFOLIO_DEMO === 'true';

export const getPublishedGames = cache(async () => {
  if (isDemo) {
    const projects = await readDemoProjects();
    return projects.filter((project) => project.published).sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  }
  if (!process.env.DATABASE_URL) return [];
  try {
    const games = await prisma.game.findMany({ where: { published: true }, orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }] });
    return await Promise.all(games.map(resolveGameMediaUrls));
  } catch (error) {
    console.error('Failed to load published games:', error);
    return [];
  }
});

export const getPublishedGame = cache(async (slug) => {
  if (isDemo) {
    const projects = await readDemoProjects();
    return projects.find((game) => game.slug === slug && game.published) || null;
  }
  if (!process.env.DATABASE_URL) return null;
  const game = await prisma.game.findFirst({ where: { slug, published: true }, include: gameInclude });
  return game ? resolveGameMediaUrls(game) : null;
});
