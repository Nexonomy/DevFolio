import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Work from './components/Work';
import About from './components/About';
import Contact from './components/Contact';
import PixelDivider from './components/PixelDivider';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function Home() {
  let games = [];

  try {
    games = await prisma.game.findMany({
      where: { published: true },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    });
  } catch (error) {
    console.error('Failed to load games:', error);
  }

  return (
    <>
      <Navbar />
      <Hero />
      <PixelDivider />
      <Work games={games} />
      <PixelDivider />
      <About />
      <PixelDivider />
      <Contact />
    </>
  );
}
