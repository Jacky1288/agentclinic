# Phase 0 — Skeleton: Validation

Phase 0 can merge when **all** of the following hold on a fresh clone.

The file/config checks below are encoded as Vitest tests in
`tests/validation/phase-0-skeleton.test.ts`. Run them with:

```bash
pnpm test
```

A green `pnpm test` is the single landing gate for the encoded sections
(2 partial, 4, and 5 below). The command-style checks (sections 1 and 3)
are run by hand against a fresh clone — they aren't worth encoding in
Vitest because they shell out and add flakiness for no signal we don't
already get by running the commands directly.

## 1. Setup works cold *(manual)*

```bash
pnpm install
pnpm prisma generate
pnpm dev
```

- `pnpm install` completes without warnings about missing peers that block
  the build.
- `pnpm prisma generate` succeeds against the empty `schema.prisma`
  (generator + datasource only, zero models).
- `pnpm dev` starts the Next.js server and prints a local URL.

## 2. The roadmap goal is met

Opening the local URL in a modern browser shows a **styled** landing page that:

- Displays the heading "AgentClinic". *(Vitest: heading + title checks)*
- Includes a short blurb that lands the joke (a clinic for AI agents with
  prompt fatigue / context exhaustion / etc.) — a stranger reading it should
  get the concept in roughly five seconds. *(Vitest: joke keywords)*
- Is visibly styled with Tailwind: centered layout, readable typography,
  intentional spacing. Not the unstyled-HTML look. *(manual — visual)*
- Renders cleanly on a 1080p screen with no horizontal scroll and no
  console errors. *(manual — visual)*

The page is wrapped in the **MainLayout** component
(`src/components/layout/`), which provides the `<header>` / `<main>` /
`<footer>` landmarks and a dedicated `MainLayout.css` chassis stylesheet.
The wrap, the components, and the CSS import are all checked by Vitest.

## 3. Quality gates are clean *(manual)*

```bash
pnpm typecheck   # tsc --noEmit, strict mode
pnpm lint        # ESLint on .ts/.tsx
```

Both exit 0. No `any` introduced in app code.

## 4. Repo hygiene *(Vitest)*

- `pnpm-lock.yaml` is committed; `package-lock.json` is gone.
- `.env` is gitignored; `.env.example` is committed with
  `DATABASE_URL="file:./dev.db"`.
- `prisma/dev.db` (if created) is gitignored.
- No leftover placeholder files from the initial scaffold (`src/index.ts`
  from the old TS-only setup is removed).

## 5. Out-of-scope guardrail *(Vitest)*

The following must **not** exist yet (they belong to later phases):

- Any Prisma model — `schema.prisma` has zero `model` blocks.
- Any route besides `/` (no `/agents`, `/ailments`, `/therapies`,
  `/appointments`, `/dashboard`).
- shadcn/ui, react-hook-form, Zod, Playwright dependencies. (Vitest is
  installed — it's the validation harness, not a forbidden phase dep.)

If a reviewer finds one of these, it's scope creep — bounce it to the
appropriate phase rather than landing it here.
