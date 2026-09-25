import PortfolioScenes from './components/PortfolioScenes';
import { getPublishedGames, isDemo } from '@/lib/portfolio';
import { getProfile } from '@/lib/profile';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const [projects, profile] = await Promise.all([getPublishedGames(), getProfile()]);
  const games = projects.filter(project => (project.portfolioSection || 'GAME') === 'GAME');
  const otherProjects = projects.filter(project => project.portfolioSection === 'OTHER');
  return <main id="main"><PortfolioScenes profile={profile} games={games} otherProjects={otherProjects} demoMode={isDemo} /></main>;
}
