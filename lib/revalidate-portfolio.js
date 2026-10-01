import { revalidatePath } from 'next/cache';

function projectPath(project) {
  if (!project?.slug) return null;
  return `${project.portfolioSection === 'OTHER' ? '/projects/' : '/games/'}${project.slug}`;
}

export function revalidatePortfolio(...projects) {
  revalidatePath('/');
  new Set(projects.map(projectPath).filter(Boolean)).forEach((path) => revalidatePath(path));
}
