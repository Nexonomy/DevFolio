# DevFolio redesign progress

## Baseline
- Original folder: E:/MangoMango Ahsan/Personal/DevFolio-main. Preserved unchanged.
- Working deliverable: this directory. No .git or uncommitted changes can be identified; original is an unversioned source snapshot.
- Dependencies and environment configuration absent. npm not on PATH.
- Existing build runs Prisma migrations against DATABASE_URL before Next.js compilation; do not connect to or modify an external database.
- Stack, routes, admin, authentication and media handling will be preserved.

## Remaining
1. Install locked dependencies and record baseline validation.
2. Improve navigation, hero, project presentation and responsive styles in coherent phases.
3. Make Three.js lifecycle and fallback safe.
4. Validate build, desktop/mobile navigation and hand off.

Exact next action: locate npm and install existing locked dependencies in this copy.

## Phase 1: core presentation
- Baseline Next.js production compilation PASS; original build pipeline blocked by missing DATABASE_URL (Prisma P1012).
- Locked npm dependencies installed; package-lock unchanged. No external database touched.
- Added server-rendered hero, projects and about sections; content no longer depends on animation.
- Added desktop links, native mobile disclosure navigation, skip link and theme control.
- Added portfolio.css as a reversible styling layer; retained admin and gallery styles.
- Files: app/page.js, app/layout.js, app/portfolio.css, components/{Navbar,Hero,Work,About}.js.
- Next action: validate core, then add explicit preview fixtures and safe Three.js lifecycle.

## Phase 1 validation
- Targeted ESLint passes after replacing home navigation with Next Link.
- Main page HTTP 200; verified desktop and 390px mobile layout in browser.
- Mobile menu opens, closes on navigation; project detail route loads.

## Phase 2: content and Three.js
- Existing seed games available only with explicit PORTFOLIO_DEMO=true; preview banner on both index and detail pages. No invented public projects.
- Added lib/portfolio.js shared cached queries and no-database empty state. Authentication/API routes remain unchanged.
- Removed fake email and generic social destinations; optional validated contact environment settings documented in .env.example.
- Three.js: lazy alternate scene, capped pixel ratio and 30fps, local pointer tracking, ResizeObserver, offscreen/hidden-tab pause, manual pause, reduced-motion/data-saving fallback, context-loss fallback and GPU disposal.
- Game detail styles aligned with portfolio; native modal screenshot viewer adds Escape and focus trapping.
- Files: lib/{portfolio,demo-games}.js, app/page.js, app/games/[slug]/page.js, components/{Contact,ThreeBackground,GameDetail,Navbar}.js, portfolio.css, .env.example.
- Next action: final lint/build and browser checks; document results and unresolved real content configuration.

## Stabilization
- Removed unused legacy public-theme CSS; retained admin/gallery layout rules and used system fonts (no external font request).
- Full ESLint passes, including Three.js lifecycle.
- Added build:local (Prisma generation + production Next build) for safe compilation without database migrations. Original build and migration scripts remain unchanged.
- Next action: final build and responsive checks; no further features planned.

## User-directed visual revision
- User found the first version too white and businesslike; requested personal, fun, modern design and clearer project hierarchy.
- Preserved validated v1 presentation in workspace work/validated-v1 before revising.
- New direction: low-glare dark surfaces by default, lime/lavender accents, locally hosted Space Grotesk variable font, personal copy, live-world sticker and fully separated game panels.
- Featured project is the clear primary item; secondary cards have independent borders, colored covers, genre labels, tech chips and consistent bottom actions.
- Next action: validate revised desktop/mobile presentation and production build.

## Artistic compilation pass
- Replaced the rigid coordinate/HUD treatment with a softer playable-storybook composition and plain navigation language.
- Hero Three.js scene now presents four selectable miniature game scenarios: an enchanted grove, neon racer city, desert temple and orbit station.
- Added smooth world-to-world camera movement, selected-world emphasis, atmospheric palette blending, star field, cursor response, optional sound and a reduced-motion/data-saving fallback.
- Project hierarchy remains asymmetric but uses rounded, varied silhouettes with clear featured/secondary separation and readable copy.
- Full ESLint PASS.
- Optimized Next.js production build PASS; no external database or deployment touched.
- Original source folder remains unchanged.
## Midnight carnival revision
- User requested a more interesting 3D space, automatic movement, removal of internal bars and a new color scheme.
- Hero world now contains only the WebGL canvas (plus its non-WebGL fallback); selector, caption, sticker, pause control and lower strip were removed.
- Four game dioramas cycle automatically every 5.8 seconds with eased travel, camera drift, pointer parallax, floating islands, glowing halos, orbiting motes and atmospheric stars.
- Recolored the full site in midnight plum, coral, aqua and soft ivory; removed the theme switch to keep one deliberate art direction.
- Full ESLint PASS and optimized Next.js production build PASS.
## 3D visibility and theme restoration
- Restored the light/dark theme button with two deliberate palettes: midnight plum and warm parchment.
- Found and removed stale scene-controller references that threw during browser startup and hid the WebGL canvas.
- Simplified the renderer to direct WebGL output, moved the camera closer and raised exposure so each game diorama reads clearly.
- Reduced-motion and data-saving users now receive a rendered static 3D frame instead of an intentionally hidden canvas.
- ESLint PASS; optimized Next.js production build PASS; local production route HTTP 200.
- A fresh 1440x1000 browser render was captured successfully after the fix.
## Dream arcade 3D revision
- User approved the rest of the site and requested a more beautiful, interesting and optimized 3D scene.
- Reworked the scene from a sideways world slider into a true orbital composition with four game dioramas circling a luminous central portal.
- Added a faceted animated portal core, counter-rotating rings, a subtle torus-knot energy ribbon, depth-based world movement, bobbing, rotating relics, orbiting motes and color-reactive fog.
- Reduced island geometry scale, capped DPR at 1.3 desktop / 1.0 mobile, retained 30fps cap and offscreen/hidden-tab pause, and preserved reduced-motion static rendering.
- No other site section was changed.
- ESLint PASS; optimized Next.js production build PASS; isolated 1440x1000 browser render produced successfully.
## Portfolio taxonomy and secondary work
- Games remain the primary homepage section under "Game Development & Design".
- Added a visually separate "Other things I make" section for film, tools, interactive art, web work and other disciplines.
- Added portfolioSection (GAME / OTHER) and projectContext (PERSONAL / COMPANY / ACADEMIC / HACKATHON) to the Prisma model, migration, validation and create/update APIs.
- Added both selectors to the admin form and Section/Context columns to the admin dashboard.
- Added context badges to homepage cards and detail pages.
- Added /projects/[slug] for non-game details and guarded /games/[slug] from serving non-game work.
- Demo mode includes two clearly identified sample non-game records and the admin dashboard now loads all fixtures safely in read-only mode.
- Final checks: ESLint PASS; optimized production build PASS; homepage 200; admin 200; other-project detail 200; incorrect game URL for other work 404.
## Phase 7 — Portfolio taxonomy and project switcher
- Kept game development and design as the primary body of work.
- Added a distinct Other Projects collection with its own detail route.
- Added Personal, Company, Academic, and Hackathon context tags across the public portfolio and admin editor.
- Added a sticky secondary project navigator beneath the hero for Game worlds and Other things; it follows the visible section and stays separate from the main site navigation.
- Restored the main navigation to Work, About, and Say hello.
- Verified ESLint, the optimized production build, homepage, admin preview, and non-game project route.

## Phase 8 — Compact project carousel
- Replaced the secondary pill navbar with a small horizontal collection slider.
- Added left/right controls, collection numbering, progress marks, and automatic section tracking.
- Added distinct coral and teal states for the game and non-game collections.
- Kept the slider compact and responsive so it acts as a transition between project categories.
- Verified ESLint, production build, homepage, and admin preview.

## Phase 8 — Side-project shelf, experience, and tools
- Removed the secondary project navigation entirely.
- Rebuilt Other things as a compact horizontal, scroll-snapping shelf of clickable project cards.
- Added an Experience section with a fluid project-based timeline.
- Added a Tools section organized into Build, Shape, and Move clusters.
- Added Experience to the main navigation.
- Verified ESLint, production build, homepage content, admin preview, and project detail routing.

## Phase 9 — Featured carousel and visual skill storytelling
- Rebuilt Other things as a true featured carousel with a centered landscape card and neighboring-card previews.
- Added arrow navigation, clickable progress dots, touch swiping, keyboard-focus safety, and direct project links.
- Reworked Experience into a winding journey map with staggered milestones.
- Reworked Tools into an orbiting constellation around a Play / Make / Repeat core.
- Preserved responsive layouts, reduced-motion support, light and dark themes, project routes, and admin preview.
- Verified ESLint, optimized production build, homepage UI markers, project route, and admin route.

## Phase 10 — Experience and tool art-direction pass
- Reworked the Other things heading into a single horizontal title band while retaining the centered landscape carousel.
- Redesigned Experience as an open journey map with orbital numbered checkpoints, connecting route, role notes, and discipline markers instead of boxed list items.
- Redesigned Tools as an interactive loadout. Build, Shape, and Move buttons rearrange the relevant tools around a central stage.
- Added responsive adaptations and reduced-motion support for both visual systems.
- Verified ESLint, optimized production build, homepage sections, tool controls, project routes, admin preview, and clean runtime logs.

## Phase 11 — Stable Experience, Toolkit, and Other Work refactor
- Replaced the absolute-position Experience and Tools compositions with one responsive Experience & Toolkit section.
- Added a two-column desktop grid and a natural vertical mobile flow with consistent spacing, headers, tags, and content alignment.
- Converted Other Work to a true horizontal flex row with fixed-width cards, horizontal overflow, smooth scrolling, scroll snapping, and a styled thin scrollbar.
- Preserved project links, context tags, responsive themes, project routes, and admin preview.
- Verified ESLint, optimized production build, required CSS layout rules, homepage content, project route, and admin route.

## Phase 11 — Art-direction recovery and stylesheet repair
- Found and removed a stale, unclosed responsive block that caused the new section CSS to be ignored in the browser.
- Rebuilt Other Work as a dark horizontal side-quest filmstrip with fixed-width scroll-snapping cards.
- Redesigned Experience and Toolkit as a coral editorial story sheet with a nested dark creative loadout.
- Preserved clean grid/flex flow, mobile stacking, legible tags, project links, light/dark modes, and reduced-motion behavior.
- Completed live browser visual QA for both sections after the production build.

## Phase 12 — Distinct side work, role icons, and loadout collage
- Removed the written horizontal-scroll prompt from Other Work.
- Added four sample side projects, bringing the demo showcase to six cards for realistic scrolling tests.
- Added a project count, clipped card edges, edge fades, and a small animated direction rail so horizontal movement is visually self-evident.
- Refocused Experience on roles, organizations, dates, and organization types such as Independent, Society, and Academic.
- Added a configurable icon to each experience entry.
- Rebuilt Toolkit as a three-color loadout collage with unique Build, Shape, and Move silhouettes.
- Visually reviewed both sections in a real browser and verified ESLint, production build, sample project routes, and admin preview.

## Phase 13 — Arrow gallery and non-repeating role/loadout design
- Replaced the Other Work scrollbar and animated rail with visible previous/next arrow controls that move by one card.
- Kept the horizontal snap track, clipped edges, project count, and six sample projects.
- Rebuilt Experience into one featured current role plus a compact secondary career trail.
- Preserved configurable icons, organization type, position, dates, organization name, descriptions, and skill tags.
- Rebuilt Toolkit as one organic color-coded tool cloud instead of repeated category cards.
- Completed live browser visual QA and verified ESLint, production build, project routes, and admin preview.

## Final interaction and art-direction pass
- Added mouse-wheel and click-drag carousel control to Other Work, with accidental link activation blocked after dragging.
- Used Anime.js for eased arrow movement, nearest-card snapping, and staggered Experience/Toolkit reveals.
- Redesigned Experience & Toolkit as a plum night-garden scene with a coral featured role and an ivory toolkit island.
- Kept reduced-motion support and native touch scrolling.
- Verified ESLint, the production build, home, project detail, and admin routes.
- Visually reviewed the settled Other Work and Experience/Toolkit sections at desktop size.

## Smooth carousel and section distinction refinement
- Replaced direct wheel stepping with requestAnimationFrame inertia and nearest-card settling.
- Coordinated wheel, drag, and Anime.js arrow motion so competing animations stop cleanly.
- Added a sweeping side-quest backdrop and oversized ambient typography to distinguish the carousel from the Experience island.
- Strengthened the visual transition into About and Contact while preserving the existing portfolio language.
- Verified the wheel animation across multiple frames, ESLint, production build, project detail, and admin routes.

## Expanded experience preview
- Added three sample entries for a company internship, hackathon lead role, and society creative position.
- Experience section now demonstrates six total roles.
- Added varied icon colors and a full-width final trail item for a balanced five-entry supporting layout.
- Verified the expanded section visually and with a production build.

## Toolkit moved into the Human Bit
- Removed the toolkit from Experience and expanded Experience into a standalone six-role timeline.
- Rebuilt About as a warm personal profile with a dark embedded creative-inventory pocket.
- Grouped tools into Build worlds, Shape the feel, and Make it move with distinct visual treatments.
- Added Anime.js entrance choreography for the profile, tool families, and individual tools.
- Verified the production build, homepage structure, admin route, and full desktop compositions.

## Simplified chronology and ungrouped visual toolkit
- Rebuilt Experience as a single chronological path from the earliest role to a highlighted current focus.
- Standardized the date, marker, role, organization, and description reading order.
- Removed toolkit categories and gave all 16 tools individual symbol-led inventory tiles.
- Added staggered Anime.js reveals and lightweight icon hover motion.
- Verified ESLint, production build, homepage, admin, and desktop visual composition.

## Reverse chronological experience order
- Moved the current independent game developer role to the top of the timeline.
- Sorted remaining roles from newest to oldest.
- Updated the heading and range guide to communicate Latest first / Now to 2023.
reti: `n- Verified lint, production build, and the final desktop timeline.

## Admin studio redesign and cursor repair
- Scoped the custom cursor to the homepage so Admin and project-detail pages use the native system cursor.
- Rebuilt Admin as a Portfolio Studio with project totals, a clear content shelf, and visual project cards.
- Redesigned Admin navigation, buttons, forms, empty states, and preview notices for readability.
- Added a safe local-demo authentication secret fallback while retaining explicit secrets for production.
- Verified lint, production build, Admin, game detail, other-project detail, and computed cursor behavior.
