# Phase 0 — Skeleton: Plan

Four task groups, in order. Each group is independently demoable: after group
N, the prior groups still work.

## 1. Bootstrap — Next.js + TypeScript + tooling

1.1 Replace the placeholder `package.json` / `src/index.ts` with a fresh
    Next.js App Router scaffold (TypeScript, ESLint, App Router, `src/`
    directory, no Tailwind from the CLI — we wire it ourselves in group 2 to
    keep the steps legible).
1.2 Set TypeScript to `strict: true` and confirm `noUncheckedIndexedAccess`
    and related strict flags are on.
1.3 Switch the package manager to pnpm: delete `package-lock.json`, run
    `pnpm install`, commit `pnpm-lock.yaml`.
1.4 Add scripts: `dev`, `build`, `start`, `lint`, `typecheck` (`tsc
    --noEmit`).
1.5 Verify `pnpm dev` serves the stock Next.js page, `pnpm lint` and
    `pnpm typecheck` are clean.

## 2. Styling — Tailwind CSS

2.1 Install `tailwindcss`, `postcss`, `autoprefixer`. Generate `tailwind.config.ts`
    and `postcss.config.mjs`.
2.2 Point `content` at `./src/**/*.{ts,tsx}`.
2.3 Replace `src/app/globals.css` with the three Tailwind directives plus a
    minimal base layer (font, background).
2.4 Drop a Tailwind utility into `src/app/page.tsx` (placeholder) to confirm
    styles apply. Verify in browser.

## 3. Data — Prisma + SQLite (empty schema)

3.1 Install `prisma` (dev) and `@prisma/client`. Run `pnpm prisma init
    --datasource-provider sqlite`.
3.2 Set `DATABASE_URL="file:./dev.db"` in `.env`. Add `.env` to `.gitignore`
    and commit a `.env.example`.
3.3 Leave `prisma/schema.prisma` with the generator + datasource blocks and
    **zero models**.
3.4 Run `pnpm prisma generate` — it must succeed against the empty schema.
3.5 Add a tiny `src/lib/db.ts` that exports a singleton `PrismaClient`
    (the standard Next.js pattern that survives hot reload). Do not import
    it from any page yet — it just has to compile.

## 4. Page — Landing

4.1 Rewrite `src/app/page.tsx` as a server component:
    - Heading: "AgentClinic".
    - One-paragraph blurb that lands the joke (a clinic for weary AI
      agents — prompt fatigue, context exhaustion, hallucination flare-ups).
    - A short tagline or sub-line nodding to "spec-driven demo" so course
      readers know what they're looking at.
4.2 Update `src/app/layout.tsx` metadata: `title` = "AgentClinic",
    `description` = the joke in one sentence.
4.3 Style with Tailwind: centered column, generous spacing, readable type,
    looks intentional on a 1080p booth screen.
4.4 Final pass: `pnpm dev`, `pnpm typecheck`, `pnpm lint`, `pnpm prisma
    generate` all clean. Hand off to `validation.md`.
