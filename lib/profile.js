import 'server-only';

import { cache } from 'react';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { prisma } from './prisma';

export const defaultProfile = {
  id: 'primary',
  name: 'Ahsan Tariq',
  heroEyebrow: 'WELCOME TO MY LITTLE CORNER.',
  heroLead: 'Code. Play.',
  heroAccent: 'A little magic.',
  heroSubtitle: 'Game developer. Pixel enthusiast. Player at heart. I turn curious ideas into worlds you can jump into.',
  bioTitle: 'Equal parts player & maker.',
  bioParagraphs: [
    'My love for games started with 8-bit classics. Today, I bring design, programming, and pixel artistry together to build experiences with tight mechanics, compelling stories, and visual charm.',
    'From prototyping core loops in Unity to polishing the final frames, I care about how every detail feels in the player’s hands. Every jump, puzzle, and line of dialogue should serve the journey.',
  ],
  values: ['Player-first thinking', 'Curious systems', 'Visual storytelling'],
  tools: [
    { name: 'Unity', icon: '◈' }, { name: 'Unreal Engine', icon: 'U' }, { name: 'Godot', icon: '♙' },
    { name: 'C#', icon: '#C' }, { name: 'C++', icon: '++' }, { name: 'GDScript', icon: 'Gd' },
    { name: 'Blender', icon: '◒' }, { name: 'Pixel Art', icon: '▦' }, { name: 'Shader Graph', icon: '⌁' },
    { name: 'UI / UX', icon: '◎' }, { name: 'Game Design', icon: '♟' }, { name: 'After Effects', icon: 'Ae' },
    { name: 'TouchDesigner', icon: '✣' }, { name: 'Motion Design', icon: '↝' }, { name: 'Sound Design', icon: '♫' },
    { name: 'WebSockets', icon: '⇄' },
  ],
  experiences: [
    { period: 'Now', role: 'Independent game developer', organization: 'Personal studio & prototypes', type: 'Independent', icon: '🎮', description: 'Taking ideas from the first playable loop through systems, level feel, visual direction, and the final polish pass.', current: true },
    { period: '2024 — 25', role: 'Game design lead', organization: 'Student game society', type: 'Society', icon: '♟', description: 'Guided small teams through concept decisions, playable milestones, feedback sessions, and presentation builds.', current: false },
    { period: '2024 — 25', role: 'Technical art contributor', organization: 'Academic project team', type: 'Academic', icon: '✦', description: 'Connected code and art through shaders, interfaces, animation systems, and player feedback.', current: false },
    { period: 'Summer 2024', role: 'Gameplay programmer intern', organization: 'Northstar Interactive', type: 'Company', icon: '⌁', description: 'Built interaction systems, tuned controls, and turned design feedback into stable playable features.', current: false },
    { period: 'Spring 2024', role: 'Game jam team lead', organization: '48-hour campus game jam', type: 'Hackathon', icon: '⚡', description: 'Scoped an experimental game and guided the team from a rough pitch to a complete submission.', current: false },
    { period: '2023 — 24', role: 'Creative media coordinator', organization: 'University computing society', type: 'Society', icon: '◉', description: 'Designed event visuals, organized showcase material, and shaped a consistent creative voice across student-led technical events.', current: false },
  ],
  email: 'ahsan02tariq@gmail.com',
  githubUrl: 'https://github.com/Nexonomy',
  linkedinUrl: 'https://www.linkedin.com/in/ahsantariq02',
  resumeUrl: '/Ahsan-Tariq-Resume.pdf',
  profileImageUrl: null,
};

const demoPath = path.join(process.cwd(), '.demo-data', 'profile.json');
let profileMutation = Promise.resolve();

const text = (value, fallback = '') => String(value ?? fallback).trim();
const list = (value) => Array.isArray(value) ? value : [];

export function parseProfileBody(body = {}) {
  const profile = {
    ...defaultProfile,
    name: text(body.name, defaultProfile.name),
    heroEyebrow: text(body.heroEyebrow, defaultProfile.heroEyebrow),
    heroLead: text(body.heroLead, defaultProfile.heroLead),
    heroAccent: text(body.heroAccent, defaultProfile.heroAccent),
    heroSubtitle: text(body.heroSubtitle, defaultProfile.heroSubtitle),
    bioTitle: text(body.bioTitle, defaultProfile.bioTitle),
    bioParagraphs: list(body.bioParagraphs).map((item) => text(item)).filter(Boolean).slice(0, 8),
    values: list(body.values).map((item) => text(item)).filter(Boolean).slice(0, 12),
    tools: list(body.tools).map((item) => ({ name: text(item?.name), icon: text(item?.icon, '◇').slice(0, 4) })).filter((item) => item.name).slice(0, 40),
    experiences: list(body.experiences).map((item) => ({
      period: text(item?.period), role: text(item?.role), organization: text(item?.organization),
      type: text(item?.type, 'Experience'), icon: text(item?.icon, '✦').slice(0, 4),
      description: text(item?.description), current: Boolean(item?.current),
    })).filter((item) => item.role && item.period).slice(0, 30),
    email: text(body.email, defaultProfile.email),
    githubUrl: text(body.githubUrl) || null,
    linkedinUrl: text(body.linkedinUrl) || null,
    resumeUrl: text(body.resumeUrl, defaultProfile.resumeUrl),
    profileImageUrl: text(body.profileImageUrl) || null,
  };
  if (!profile.bioParagraphs.length) profile.bioParagraphs = defaultProfile.bioParagraphs;
  return profile;
}

async function readDemoProfile() {
  try { return parseProfileBody(JSON.parse(await readFile(demoPath, 'utf8'))); }
  catch (error) { if (error.code !== 'ENOENT') console.error('Failed to read demo profile:', error); return defaultProfile; }
}

export async function saveDemoProfile(data) {
  const operation = profileMutation.then(async () => {
    const profile = parseProfileBody(data);
    await mkdir(path.dirname(demoPath), { recursive: true });
    const temporaryPath = demoPath + '.' + process.pid + '.' + Date.now().toString(36) + '.tmp';
    await writeFile(temporaryPath, JSON.stringify(profile, null, 2), 'utf8');
    await rename(temporaryPath, demoPath);
    return profile;
  });
  profileMutation = operation.then(() => undefined, () => undefined);
  return operation;
}

export const getProfile = cache(async () => {
  if (process.env.PORTFOLIO_DEMO === 'true') return readDemoProfile();
  if (!process.env.DATABASE_URL) return defaultProfile;
  try {
    const stored = await prisma.profile.findUnique({ where: { id: 'primary' } });
    return stored ? parseProfileBody(stored) : defaultProfile;
  } catch (error) {
    console.error('Failed to load profile:', error);
    return defaultProfile;
  }
});

export async function saveProfile(data) {
  const profile = parseProfileBody(data);
  if (process.env.PORTFOLIO_DEMO === 'true') return saveDemoProfile(profile);
  return prisma.profile.upsert({
    where: { id: 'primary' },
    create: { id: 'primary', ...profile },
    update: profile,
  });
}