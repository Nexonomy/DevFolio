import { PrismaClient } from '@prisma/client';
import { demoGames, demoOtherProjects } from '../lib/demo-games.js';

const prisma = new PrismaClient();

const games = [...demoGames, ...demoOtherProjects].map((game) => ({
  ...game,
  categories: game.categories || [game.tag],
}));

async function main() {
  for (const game of games) {
    await prisma.game.upsert({
      where: { slug: game.slug },
      update: game,
      create: game,
    });
  }

  console.log(`Seeded ${games.length} portfolio projects.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
