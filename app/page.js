import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Work from './components/Work';
import OtherProjects from './components/OtherProjects';
import ExperienceToolkit from './components/ExperienceToolkit';
import About from './components/About';
import Contact from './components/Contact';
import PortfolioFX from './components/PortfolioFX';
import { getPublishedGames, isDemo } from '@/lib/portfolio';
import { getProfile } from '@/lib/profile';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const [projects, profile] = await Promise.all([getPublishedGames(), getProfile()]);
  const games = projects.filter(project => (project.portfolioSection || 'GAME') === 'GAME');
  const otherProjects = projects.filter(project => project.portfolioSection === 'OTHER');

  return <><Navbar profile={profile} /><PortfolioFX /><main id="main">{isDemo && <p className="demo-notice">Preview build / sample project data</p>}<Hero profile={profile} /><Work games={games} /><OtherProjects projects={otherProjects} /><ExperienceToolkit experiences={profile.experiences} /><About profile={profile} /><Contact profile={profile} /></main></>;
}