import { cache } from 'react';
import { prisma } from './prisma';
import { gameInclude } from './games';
import { resolveGameMediaUrls } from './blob';
import { demoGames, demoOtherProjects } from './demo-games';

export const isDemo = process.env.PORTFOLIO_DEMO === 'true';
const fixtures = [...demoGames, ...demoOtherProjects].map(game => ({ ...game, id: game.slug, portfolioSection: game.portfolioSection || 'GAME', projectContext: game.projectContext || 'PERSONAL', screenshots: [], videos: [] }));

export const getPublishedGames = cache(async () => {
  if (isDemo) return fixtures;
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
  if (isDemo) return fixtures.find(game => game.slug === slug) || null;
  if (!process.env.DATABASE_URL) return null;
  const game = await prisma.game.findFirst({ where: { slug, published: true }, include: gameInclude });
  return game ? resolveGameMediaUrls(game) : null;
});
