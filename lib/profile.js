import 'server-only';

import { cache } from 'react';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { prisma } from './prisma';

export const defaultProfile = {
  id: 'primary',
  name: 'Ahsan Tariq',
  heroEyebrow: 'LAHORE · SHIPPING PLAYABLE SYSTEMS.',
  heroLead: 'Code. Ship.',
  heroAccent: 'Play forward.',
  heroSubtitle: 'Game Dev & Software Engineer at MangoMango Games. I build Unity-powered gameplay, AI-driven directors, real-time multiplayer, and cross-platform mobile — from LLM-orchestrated roguelikes to Web3 PvP and AR experiences.',
  sectionCopy: {
    introKicker: 'Game Dev · Software Engineer · Unity · C# · AI',
    workTitle: 'Game Development Portfolio',
    workDescription: 'Selected shipped games and prototypes: AI-driven roguelikes, real-time multiplayer, mobile FPS, AR, physics puzzles, and native bridges. Each is a case study in gameplay programming and systems architecture.',
    otherTitle: 'Additional Projects',
    otherDescription: 'Selected creative and technical work beyond primary game projects.',
    experienceTitle: 'Experience and Achievements',
    experienceDescription: 'Industry roles at MangoMango Games and Euphoria XR, campus leadership at UMT, and competition results at GIKI SoftCom and Google AI Seekho.',
    contactPrompt: 'Open to full-time, contract, and collaboration enquiries',
    contactTitle: 'Let’s build the next one together.',
  },
  bioTitle: 'Associate Software Engineer. Game systems first.',
  bioParagraphs: [
    'I’m Ahsan Tariq — Associate Software Engineer at MangoMango Games in Lahore. Over the last two years I’ve shipped commercial mobile titles, engineered multi-agent LLM directors, real-time multiplayer netcode, AR Foundation experiences, and React Native ↔ Unity bridges across live games and award-winning prototypes.',
    'Final-year BSCS at the University of Management and Technology — 3.90 CGPA, three-time Rector Award holder, Dean’s Award. 🥇 Game Development at GIKI SoftCom ’26 and finalist at Google AI Seekho 2026 Regional. I like owning a feature end-to-end: gameplay code, mobile monetization, custom editor tooling, and the polish pass that makes it feel good in the player’s hands.',
  ],
  values: ['Player-first thinking', 'Systems that scale on mobile', 'Shipping over polishing in place'],
  tools: [
    { name: 'Unity', icon: '◈' },
    { name: 'C#', icon: 'C#' },
    { name: 'Photon Fusion', icon: '⇄' },
    { name: 'Firebase', icon: '🔥' },
    { name: 'AR Foundation', icon: 'AR' },
    { name: 'XR Interaction', icon: 'XR' },
    { name: 'Shader Graph', icon: '⌁' },
    { name: 'URP', icon: 'URP' },
    { name: 'NavMesh AI', icon: '◎' },
    { name: 'DOTween', icon: '↝' },
    { name: 'Feel Haptics', icon: '≈' },
    { name: 'AppLovin MAX', icon: '$' },
    { name: 'Unity IAP', icon: '🛒' },
    { name: 'Gemini / Groq / NIM', icon: '🤖' },
    { name: 'Solana Web3', icon: '◆' },
    { name: 'React Native', icon: '⚛' },
    { name: 'TypeScript', icon: 'TS' },
    { name: 'C++', icon: '++' },
    { name: 'Blender', icon: '◒' },
    { name: 'Git', icon: '⎇' },
  ],
  experiences: [
    { period: 'Aug 2026 — Present', role: 'Associate Software Engineer', organization: 'MangoMango Games', type: 'Full-time', track: 'PROFESSIONAL', icon: 'MM', description: 'Shipping commercial mobile games as full-time engineer. Owning multiplayer netcode, monetization, AI systems, and polish passes across the studio’s live titles.', current: true },
    { period: 'Aug 2025 — Jul 2026', role: 'Junior Game Developer', organization: 'MangoMango Games', type: 'Part-time', track: 'PROFESSIONAL', icon: 'MM', description: 'Built gameplay systems, UI flows, and live-ops features on commercial mobile games alongside senior engineers. Promoted to full-time on graduation.', current: false },
    { period: 'Nov 2024 — Jul 2025', role: 'AR/VR Developer', organization: 'Euphoria XR', type: 'Part-time', track: 'PROFESSIONAL', icon: 'EX', description: 'Engineered high-performance Unity runtimes embedded inside React Native mobile apps. Awarded Employee of the Month for the native bridge architecture.', current: false },
    { period: 'Aug 2024 — Oct 2024', role: 'Unity Developer Intern', organization: 'Euphoria XR', type: 'Internship', track: 'PROFESSIONAL', icon: 'EX', description: 'Developed VR applications for Meta Quest 3 using Unity XR plugins and VRIF. Focused on performance, controller mapping, and spatial UI patterns.', current: false },
    { period: 'Jul 2023 — Aug 2023', role: 'Game Development Intern', organization: 'tecHouse Games', type: 'Internship', track: 'PROFESSIONAL', icon: 'tH', description: 'First Unity production exposure. Built character controls and integrated UI/UX elements with design and dev teams.', current: false },
    { period: 'Mar 2021 — Nov 2021', role: 'Data Annotator', organization: 'Compscious', type: 'Freelance', track: 'PROFESSIONAL', icon: '◆', description: 'Annotated highway camera footage from Germany to train computer-vision models. Early exposure to the AI data pipeline.', current: false },
    { period: 'Aug 2026 — Present', role: 'Mentor', organization: 'Google Developer Group on Campus — UMT', type: 'Volunteer', track: 'ACADEMIC', icon: 'G', description: 'Guiding junior developers through game development, hackathon prep, and their first shipped projects.', current: true },
    { period: 'Aug 2024 — Aug 2026', role: 'Founding Game Development Lead', organization: 'Google Developer Group on Campus — UMT', type: 'Volunteer', track: 'ACADEMIC', icon: 'G', description: 'Founded the chapter’s first game development division and led it for two tenures. Ran Unity and C# code-alongs, mentored student teams, and organised showcases, hackathons, and game jams.', current: false },
    { period: 'Aug 2025 — Aug 2026', role: 'Vice President', organization: 'Computer Science Society — UMT', type: 'Leadership', track: 'ACADEMIC', icon: 'CS', description: 'Directed society operations, academic events, and technical hackathons for 500+ computing students, working with university leadership and industry partners on workshops and bootcamps.', current: false },
    { period: 'Feb 2025 — Jun 2025', role: 'Peer Tutor, Computer Science', organization: 'University of Management and Technology (UMT)', type: 'Tutoring', track: 'ACADEMIC', icon: 'U', description: 'Tutored undergraduates in Data Structures and Algorithms, helping them debug assignments and prepare for exams.', current: false },
    { period: 'Dec 2025', role: '1st Place, Game Development', organization: 'GIKI SoftCom ’26', type: 'National', track: 'ACHIEVEMENT', icon: '🥇', description: 'Led the UMT delegation to a national first place with Over The Top, a one-button physics runner built in Unity under the theme “One Button”.', current: false },
    { period: 'Jan 2026', role: 'Regional Finalist · 5th Place', organization: 'Google AI Seekho 2026 Hackathon', type: 'Regional', track: 'ACHIEVEMENT', icon: '5th', description: 'Placed 5th in the Lahore region with THRESHOLD, an AI-orchestrated roguelike whose multi-agent LLM director was pitched to an industry judging panel.', current: false },
    { period: '2025', role: 'Employee of the Month', organization: 'Euphoria XR', type: 'Industry', track: 'ACHIEVEMENT', icon: '★', description: 'Recognised for engineering high-performance Unity runtimes embedded inside React Native mobile apps.', current: false },
    { period: '2022 — 2026', role: '3× Rector’s & 1× Dean’s Merit Award', organization: 'University of Management and Technology (UMT)', type: 'Academic', track: 'ACHIEVEMENT', icon: '4.0', description: 'Rector’s Merit Award for three 4.00 SGPA semesters and a Dean’s Merit Award, graduating with a 3.90 CGPA in Computer Science.', current: false },
  ],
  email: 'ahsan02tariq@gmail.com',
  githubUrl: 'https://github.com/Nexonomy',
  linkedinUrl: 'https://www.linkedin.com/in/ahsantariq02',
  resumeUrl: '/Ahsan-Tariq-Resume.pdf',
  links: [],
  profileImageUrl: '/demo-uploads/1789137694201-PassportSizePhoto.png',
};

const demoPath = path.join(process.cwd(), '.demo-data', 'profile.json');
let profileMutation = Promise.resolve();

const text = (value, fallback = '') => String(value ?? fallback).trim();
const list = (value) => Array.isArray(value) ? value : [];

const AWARD_TYPES = ['Award', 'Competition', 'Honor', 'Honour'];

function resolveTrack(item) {
  // Entries saved before the Achievement track existed were tagged ACADEMIC; promote awards.
  if (item?.track === 'ACADEMIC' && AWARD_TYPES.includes(item?.type)) return 'ACHIEVEMENT';
  if (['PROFESSIONAL', 'ACADEMIC', 'ACHIEVEMENT'].includes(item?.track)) return item.track;
  return ['Company', 'Independent'].includes(item?.type) ? 'PROFESSIONAL' : 'ACADEMIC';
}

export function parseProfileBody(body = {}) {
  const sectionCopy = body.sectionCopy && typeof body.sectionCopy === 'object' ? body.sectionCopy : {};
  const profile = {
    ...defaultProfile,
    name: text(body.name, defaultProfile.name),
    heroEyebrow: text(body.heroEyebrow, defaultProfile.heroEyebrow),
    heroLead: text(body.heroLead, defaultProfile.heroLead),
    heroAccent: text(body.heroAccent, defaultProfile.heroAccent),
    heroSubtitle: text(body.heroSubtitle, defaultProfile.heroSubtitle),
    sectionCopy: Object.fromEntries(Object.entries(defaultProfile.sectionCopy).map(([key, fallback]) => [key, text(sectionCopy[key], fallback)])),
    bioTitle: text(body.bioTitle, defaultProfile.bioTitle),
    bioParagraphs: list(body.bioParagraphs).map((item) => text(item)).filter(Boolean).slice(0, 8),
    values: list(body.values).map((item) => text(item)).filter(Boolean).slice(0, 12),
    tools: list(body.tools).map((item) => ({ name: text(item?.name), icon: text(item?.icon, '◇').slice(0, 4) })).filter((item) => item.name).slice(0, 40),
    experiences: list(body.experiences).map((item) => ({
      period: text(item?.period), role: text(item?.role), organization: text(item?.organization),
      type: text(item?.type, 'Experience'), icon: text(item?.icon, '✦').slice(0, 4),
      logoImageUrl: text(item?.logoImageUrl) || null,
      certificateImages: [...new Set([...list(item?.certificateImages), item?.certificateImageUrl].map((url) => text(url)).filter(Boolean))].slice(0, 12),
      track: resolveTrack(item),
      description: text(item?.description), current: Boolean(item?.current),
    })).filter((item) => item.role && item.period).slice(0, 30),
    email: text(body.email, defaultProfile.email),
    githubUrl: text(body.githubUrl) || null,
    linkedinUrl: text(body.linkedinUrl) || null,
    resumeUrl: text(body.resumeUrl, defaultProfile.resumeUrl),
    links: list(body.links)
      .map((item) => ({ label: text(item?.label).slice(0, 40), url: text(item?.url).slice(0, 500) }))
      .filter((item) => item.label && /^(https:\/\/|mailto:)/i.test(item.url))
      .slice(0, 12),
    profileImageUrl: text(body.profileImageUrl) || null,
  };
  if (!profile.bioParagraphs.length) profile.bioParagraphs = defaultProfile.bioParagraphs;
  // Saved profiles still carry the pre-split heading; education is no longer shown in this section.
  if (profile.sectionCopy.experienceTitle === 'Experience and Education') profile.sectionCopy.experienceTitle = defaultProfile.sectionCopy.experienceTitle;
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
