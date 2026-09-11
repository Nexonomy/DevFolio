# Codex progress

## Completed

- Rebuilt the portfolio into an artistic game-developer presentation with a responsive Three.js hero, distinct project, experience, human, toolkit, and contact sections.
- Kept light/dark theme switching and scoped the custom cursor to the public portfolio so Admin and project pages use the native cursor.
- Redesigned Admin as Portfolio Studio and fixed demo credentials. In `PORTFOLIO_DEMO=true`, use `preview`; production still requires `ADMIN_PASSWORD` and a secure auth secret.
- Added game categories to the Prisma model, Admin editor, create/update APIs, demo fixtures, and homepage.
- Added a data-driven game-category rail. New comma-separated categories saved in Admin appear automatically as filters.
- Reworked Other Things as a mouse-wheel, drag, touch, and arrow-controlled carousel.
- Calibrated laptop landscape and mobile layouts, including the Other Things mobile overlap.

## Important decisions

- Categories are stored as a PostgreSQL text array and fall back to the primary genre tag for older records.
- Demo authentication is intentionally limited to demo mode. There is no default production password.
- Horizontal overflow inside category and project carousels is intentional; document-level overflow is clipped.

## Key files

- `app/components/Work.js`
- `app/components/OtherProjects.js`
- `app/components/admin/GameForm.js`
- `app/components/admin/LoginForm.js`
- `app/portfolio.css`
- `app/globals.css`
- `lib/auth.js`
- `lib/games.js`
- `prisma/schema.prisma`
- `prisma/migrations/20260911000100_add_game_categories/migration.sql`

## Validation

- ESLint: passed.
- Next.js production build: passed.
- Browser: demo password redirected to `/admin`.
- Browser: Puzzle filter reduced the visible shelf to Glyph Garden.
- Browser: checked at 1366x768 and 390x844; document width matched viewport at both sizes.
- Mobile Other Things screenshot: title, arrow controls, and card lane render without overlap.

## Next action

Deploy with `DATABASE_URL`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, and `ADMIN_PASSWORD` configured. The normal build script applies the categories migration with `prisma migrate deploy`.


## Final local-admin and wide-layout pass

- Expanded the public composition on screens wider than 1366px; the hero and primary sections now use the available canvas.
- Added an editable JSON-backed demo store at `.demo-data/projects.json`.
- Demo Admin now supports create, edit, publish, delete, and local image upload testing.
- Added library search and All / Game worlds / Side quests / Published / Draft filters.
- Added an exact `/admin` middleware match and shared demo secret so a signed-out Admin library request redirects to the password page.
- Verified temporary project create (201), Admin visibility, public category visibility, and delete (200).
- Verified a fresh `/admin` request redirects to `/admin/login?callbackUrl=%2Fadmin`.
- ESLint and production build pass.
`n- Replaced fixed project-2/project-3/project-4 placement with a scalable featured-plus-three-column grid.`n- Stress-tested 11 game cards at 1440px and 390px: zero card intersections and no document overflow.`n- Compact cards use capped media height, consistent body height, and three-line descriptions.`n- Fixed local uploaded image paths so demo images do not call Vercel Blob.`n`n- Redesigned the dynamic genre filter as a numbered Game Index with count badges, wrapped desktop controls, and a swipeable mobile rail.`n- Recolored dark mode to deep blue ink with coral and mint accents.`n- Increased light-theme separation with warmer layered surfaces, stronger borders, and controlled shadows.`n- Hardened local demo mutations with serialized writes and unique temporary files.`n- Visually checked the Work section in both themes; ESLint and production build pass.`n
## 2026-09-11 - Category rail and palette refinement
- Removed the Game index label, numbered button counts, result text, decorative rail, and wrapped filter layout.
- Rebuilt the category control as one simple, horizontally scrollable line of category pills on desktop and mobile.
- Replaced coral/orange/yellow accents with a cooler violet, teal, and blue family.
- Shifted light mode from warm beige toward cool blue-gray surfaces for clearer section separation.
- Kept the user-owned Git workflow untouched; no commit or push was performed.

## 2026-09-11 - Draggable category rail and contact details
- Added click-and-drag scrolling for the game category rail without accidental filter activation.
- Added mouse-wheel and trackpad horizontal translation while preserving native mobile swipe behavior.
- Added public contact links for ahsan02tariq@gmail.com, GitHub/Nexonomy, and LinkedIn/ahsantariq02.
- Verified drag movement, wheel movement, contact hrefs, mobile overflow containment, ESLint, and the production build.

## 2026-09-11 - Contact composer and downloadable resume
- Redesigned the contact section as a responsive message composer with name, reply email, enquiry context, and message fields.
- Form submission opens the visitor's email client with a prefilled subject, message, sender name, and reply address.
- Added a persistent Resume download action to the desktop and mobile navbar.
- Created public/Ahsan-Tariq-Resume.pdf and output/pdf/Ahsan-Tariq-Resume.pdf using verified portfolio identity, profile, practice areas, toolkit, and contact details.
- Verified the one-page A4 PDF visually and through text extraction.
- Verified the public PDF returns HTTP 200 with application/pdf, the form fits desktop and mobile layouts, and the production build passes.
