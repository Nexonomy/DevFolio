import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Work from './components/Work';
import OtherProjects from './components/OtherProjects';
import ExperienceToolkit from './components/ExperienceToolkit';
import About from './components/About';
import Contact from './components/Contact';
import PortfolioFX from './components/PortfolioFX';
import { getPublishedGames, isDemo } from '@/lib/portfolio';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const projects = await getPublishedGames();
  const games = projects.filter(project => (project.portfolioSection || 'GAME') === 'GAME');
  const otherProjects = projects.filter(project => project.portfolioSection === 'OTHER');

  return <><Navbar /><PortfolioFX /><main id="main">{isDemo && <p className="demo-notice">Preview build / sample project data</p>}<Hero /><Work games={games} /><OtherProjects projects={otherProjects} /><ExperienceToolkit /><About /><Contact /></main></>;
}
