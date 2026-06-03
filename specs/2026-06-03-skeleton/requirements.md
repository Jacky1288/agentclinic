# Phase 0 — Skeleton: Requirements

## Scope

Stand up the bare frame the rest of the roadmap will build on, end-to-end, with
nothing extra. By the end of this phase, `pnpm dev` opens a single styled
landing page that introduces AgentClinic and the joke. No domain models, no
catalog pages, no forms, no dashboards.

## In scope

- Next.js (App Router) initialized in the existing repo root.
- TypeScript in `strict` mode; no `any` in app code.
- Tailwind CSS wired through the App Router (`globals.css`, Tailwind config,
  PostCSS).
- Prisma installed with a **SQLite** provider and an **empty schema** (no
  models). `prisma generate` succeeds and the client is importable.
- ESLint + Prettier on the Next.js defaults, configured to lint TS + TSX.
- pnpm as the package manager (per [[tech-stack]]).
- One landing page at `/` with:
  - The headline "AgentClinic".
  - A short blurb that lands the joke (a clinic for weary AI agents).
  - Tailwind styling — readable, centered, presentable on a booth screen.

## Out of scope (this phase)

- shadcn/ui — defer until Phase 2 needs forms or Phase 6 needs dashboard
  primitives.
- Any Prisma models (`Agent`, `Ailment`, `Therapy`, `Appointment`). The schema
  file exists but defines zero models.
- Any route besides `/`. No `/agents`, no `/ailments`, no `/dashboard`.
- Seed scripts, server actions, forms, validation libraries.
- Vitest / Playwright setup. Testing tooling lands when a feature needs it.
- Deploy config (Vercel, env management beyond `.env` for the SQLite path).

## Key decisions

- **pnpm over npm.** The existing `package-lock.json` was from the initial TS
  scaffold; it will be removed when we switch to `pnpm-lock.yaml`. Tech stack
  calls for pnpm.
- **Empty Prisma schema now, not later.** Wiring Prisma + SQLite once, in
  isolation, keeps Phase 1 focused on the `Agent` model rather than tooling.
- **No shadcn/ui yet.** The landing page is one heading + one paragraph;
  shadcn would be ceremony. Add it when the first table or form arrives.
- **Strict TS from day one.** Cheaper than retrofitting; aligns with the
  "type safety end-to-end" principle in [[tech-stack]].

## Context

- Source of truth: `specs/roadmap.md` (Phase 0), `specs/mission.md`,
  `specs/tech-stack.md`.
- Audience the skeleton must serve: course students reading the repo as a
  worked example, and booth demoers running `pnpm install && pnpm dev` cold.
  Both groups feel the friction of any extra step.
- Current repo state: bare `package.json` with only `typescript` as a dev
  dependency and a placeholder `src/index.ts`. Both are replaced by the
  Next.js scaffold.
