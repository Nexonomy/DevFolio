import 'server-only';

import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { demoGames, demoOtherProjects } from './demo-games';

const storeDirectory = path.join(process.cwd(), '.demo-data');
const storePath = path.join(storeDirectory, 'projects.json');
let mutationQueue = Promise.resolve();

function fixtures() {
  return [...demoGames, ...demoOtherProjects].map((game) => ({
    ...game,
    id: game.id || game.slug,
    portfolioSection: game.portfolioSection || 'GAME',
    projectContext: game.projectContext || 'PERSONAL',
    categories: game.categories || [game.tag],
    screenshots: game.screenshots || [],
    videos: game.videos || [],
  }));
}

export async function readDemoProjects() {
  try {
    const content = await readFile(storePath, 'utf8');
    const projects = JSON.parse(content);
    return Array.isArray(projects) ? projects : fixtures();
  } catch (error) {
    if (error.code !== 'ENOENT') console.error('Failed to read local demo projects:', error);
    return fixtures();
  }
}

async function writeDemoProjects(projects) {
  await mkdir(storeDirectory, { recursive:true });
  const temporaryPath = storePath + '.' + process.pid + '.' + Date.now().toString(36) + '.tmp';
  await writeFile(temporaryPath, JSON.stringify(projects, null, 2), 'utf8');
  await rename(temporaryPath, storePath);
}

function mutateDemoProjects(mutation) {
  const operation = mutationQueue.then(async () => {
    const projects = await readDemoProjects();
    const result = await mutation(projects);
    await writeDemoProjects(projects);
    return result;
  });
  mutationQueue = operation.then(() => undefined, () => undefined);
  return operation;
}

export function createDemoProject(data) {
  return mutateDemoProjects(async (projects) => {
    const project = {
      ...data,
      id:'local-' + Date.now().toString(36),
      createdAt:new Date().toISOString(),
      updatedAt:new Date().toISOString(),
    };
    projects.push(project);
    return project;
  });
}

export function updateDemoProject(id, data) {
  return mutateDemoProjects(async (projects) => {
    const index = projects.findIndex((project) => project.id === id);
    if (index < 0) return null;
    const updated = { ...projects[index], ...data, id, updatedAt:new Date().toISOString() };
    projects[index] = updated;
    return updated;
  });
}

export function deleteDemoProject(id) {
  return mutateDemoProjects(async (projects) => {
    const index = projects.findIndex((project) => project.id === id);
    if (index < 0) return false;
    projects.splice(index, 1);
    return true;
  });
}
