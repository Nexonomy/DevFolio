# DevFolio — local redesign

A responsive portfolio for Ahsan Tariq, preserving the original Next.js 16, React 19, Prisma, NextAuth, Vercel Blob and Three.js stack.

## Run this copy

Use Node.js 20.9 or newer and npm. From this directory:

```sh
npm ci
npm run dev
```

The working copy has `.env.local` with `PORTFOLIO_DEMO=true`, displaying the four original seed games with an explicit sample-content notice. The source ZIP omits `.env.local`; copy `.env.example` to `.env.local` and set `PORTFOLIO_DEMO=true` to see the same preview. Demo mode never reads or writes a database.

## Safe production compilation

Stop the development server first on Windows (Prisma's engine file can be locked while the server runs).

```sh
npm run build:local
npm start
```

`build:local` generates Prisma Client and runs the production Next.js build without migrations. The original `npm run build` is preserved and still runs `prisma migrate deploy`; it requires a configured PostgreSQL `DATABASE_URL` and can modify that database. Its missing-configuration failure existed before this redesign.

## Real content

1. Set `PORTFOLIO_DEMO=false` (or remove it) for published database content.
2. Configure `DATABASE_URL`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, `ADMIN_PASSWORD`, and `BLOB_READ_WRITE_TOKEN` for the existing admin/media workflows.
3. Add real contact values from `.env.example`. Only configured HTTPS profile URLs and a valid email are shown; no generic or fake destinations are used.
4. Review the existing seed data before running any seed command. The four seed games are unverified sample content, not newly claimed portfolio work.

With no database configured and demo mode off, the home page renders a deliberate empty project state, and missing project pages return 404. A database error on a project page has a retry/back navigation fallback.

## Design and accessibility

- Clear desktop navigation; native mobile menu, Escape dismissal and skip link.
- Server-rendered hero, project cards and skills; no animation gate hides content.
- Responsive featured card and matching project details.
- System fonts, warm neutral palette and dark theme.
- Three.js is lazy-loaded, capped at 30fps, limited in pixel density and paused offscreen or in hidden tabs. Manual pause is available. Reduced-motion/data-saving users receive the CSS landscape. Context loss also falls back safely.
- Native screenshot dialog supports Escape and traps focus.

## Recovery and scope

The original folder on E: is unchanged. This directory is a standalone working copy; no commits were created because the supplied folder had no Git repository. No remote service was modified, no database migration was executed, and nothing was published.

See `CODEX_PROGRESS.md` for baseline failures, milestones, exact validation results and remaining configuration. Preserve any real environment files when transferring source changes to another checkout.
