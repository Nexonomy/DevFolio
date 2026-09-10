import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const games = [
  {
    slug: 'realm-runners',
    title: 'Realm Runners',
    description:
      'A fast-paced pixel platformer with procedurally generated levels, wall-jumping mechanics, and a retro synthwave soundtrack. Race through crumbling castles and ancient forests.',
    tag: 'PLATFORMER',
    tech: 'Unity · C# · Pixel Art',
    year: '2025',
    emoji: '🏃',
    bgColor: '#4A7C2F',
    published: true,
    sortOrder: 0,
  },
  {
    slug: 'chronicle-of-embers',
    title: 'Chronicle of Embers',
    description:
      'A top-down action RPG featuring a branching narrative, hand-drawn pixel art, and a dynamic weather system that affects gameplay and story outcomes.',
    tag: 'RPG',
    tech: 'Unreal Engine · C++ · Blueprints',
    year: '2024',
    emoji: '⚔️',
    bgColor: '#8B2E1A',
    published: true,
    sortOrder: 1,
  },
  {
    slug: 'glyph-garden',
    title: 'Glyph Garden',
    description:
      'A meditative puzzle game where players arrange ancient runes to restore magical gardens. Features 120 hand-crafted levels with increasing complexity.',
    tag: 'PUZZLE',
    tech: 'Unity · C# · Shader Graph',
    year: '2024',
    emoji: '🧩',
    bgColor: '#C8860A',
    published: true,
    sortOrder: 2,
  },
  {
    slug: 'bastion-command',
    title: 'Bastion Command',
    description:
      'A real-time strategy game set in a medieval fantasy world. Build fortresses, command armies, and defend your realm against waves of darkness.',
    tag: 'STRATEGY',
    tech: 'Godot · GDScript · Multiplayer',
    year: '2023',
    emoji: '🏰',
    bgColor: '#3B2A1A',
    published: true,
    sortOrder: 3,
  },
];

async function main() {
  for (const game of games) {
    await prisma.game.upsert({
      where: { slug: game.slug },
      update: game,
      create: game,
    });
  }

  console.log(`Seeded ${games.length} games.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
