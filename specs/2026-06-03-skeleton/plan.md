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

## 5. Layout — Main layout component (Header / Main / Footer)

5.1 Add a `src/components/layout/` directory with four files:
    - `Header.tsx` — wordmark + tagline strip across the top.
    - `Main.tsx` — wraps `children` in a `<main>` landmark.
    - `Footer.tsx` — phase note + copyright row at the bottom.
    - `MainLayout.tsx` — composes the three (`<Header>`, `<Main>{children}</Main>`,
      `<Footer>`) inside a flex column so the footer pins to the bottom on
      short pages.
5.2 Each subcomponent is a server component with no client-side state.
    Props: `Main` takes `children: React.ReactNode`; the others take none.
5.3 Add `src/components/layout/MainLayout.css` — plain CSS (no Tailwind
    directives) that owns the structural rules: full-height flex column,
    header/footer borders, max-width centered content rail, footer auto-margin
    push. Tailwind utilities still handle typography and color inside each
    subcomponent's JSX; this file is for the layout chassis.
5.4 Import the CSS once from `MainLayout.tsx` (`import "./MainLayout.css"`).
    Next.js's compiler turns that into a `<link rel="stylesheet">` on every
    page that renders the layout — verify the link tag is present in the
    served HTML.
5.5 Wire it up: change `src/app/layout.tsx` to wrap `{children}` in
    `<MainLayout>`. Drop the `<main>` wrapper from `src/app/page.tsx` (the
    `Main` subcomponent now provides the landmark) — page content becomes
    just the centered `<section>`.
5.6 Final pass: `pnpm typecheck` + `pnpm lint` clean. `pnpm dev` renders
    `/` with a visible header, the centered landing content, and a footer
    that sits at the viewport bottom on a 1080p screen.

## 6. Validation harness — Vitest

6.1 Install `vitest` as a dev dependency. Add scripts: `test` =
    `vitest run --passWithNoTests`, `test:watch` = `vitest`. The
    `--passWithNoTests` flag keeps the script honest in the gap between
    "harness installed" and "first test written" — it becomes a no-op once
    tests exist.
6.2 Write `tests/validation/phase-0-skeleton.test.ts`. Encode the file and
    config checks from `validation.md`:
    - scripts present in `package.json`; lockfile is `pnpm-lock.yaml`;
      Next/React/Tailwind/Prisma/Vitest deps installed.
    - `tsconfig.json` has `strict` and `noUncheckedIndexedAccess` on.
    - `.env` gitignored; `.env.example` carries `DATABASE_URL`;
      `prisma/dev.db` gitignored.
    - `schema.prisma` has zero `model` blocks and declares the sqlite
      provider; `src/lib/db.ts` exports a singleton client.
    - `src/app/layout.tsx` sets title "AgentClinic" and the joke
      description; `src/app/page.tsx` mentions the joke keywords (prompt
      fatigue, context exhaustion, hallucination).
    - Header/Main/Footer/MainLayout components exist, MainLayout imports
      `./MainLayout.css`, and `app/layout.tsx` wraps `{children}` in
      `<MainLayout>`.
    - No forbidden routes (`/agents`, `/ailments`, …); no forbidden deps
      (shadcn/ui, react-hook-form, Zod, Playwright).
6.3 Update `validation.md` to mark which sections the test file covers and
    which remain manual (the cold-start commands in §1 and the typecheck/
    lint gates in §3 stay manual — shelling out to them from inside Vitest
    would add flakiness without new signal).
6.4 Final pass: `pnpm test` is green; `pnpm typecheck` + `pnpm lint` still
    clean.

## 7. Responsive design pass

7.1 `src/app/page.tsx` — hero scales mobile-first: heading
    `text-4xl sm:text-5xl md:text-6xl`, blurb gets a tighter mobile
    `text-base sm:text-lg`, the centered column drops to
    `max-w-md sm:max-w-2xl` so phones don't waste line length.
7.2 `src/components/layout/Header.tsx` — flex row stacks on phones:
    `flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between`.
    The "Open daily" tag stays visible at every width (it's the proof the
    second column is alive).
7.3 `src/components/layout/Footer.tsx` — same stacking treatment so the
    copyright doesn't shove into the phase note on narrow screens.
7.4 `src/components/layout/MainLayout.css` — rail padding scales with the
    viewport: `1rem` baseline, `1.5rem` at `min-width: 640px` (`sm`), `2rem`
    at `min-width: 1024px` (`lg`). The 64rem max-width cap stays.
7.5 Update `specs/mission.md` (add a "Responsive by default" principle),
    `specs/tech-stack.md` (note responsive utilities under Tailwind; add a
    "Responsive design" section with target viewports), and the Phase 0
    `requirements.md` / `validation.md` so the gate is documented.
7.6 Update `tests/validation/phase-0-skeleton.test.ts` with a
    "Responsive design" describe block: hero hits all three breakpoint
    sizes, Header and Footer use `sm:flex-row`, `MainLayout.css` has the
    media-query padding rules. Update `tests/render/landing.test.tsx`
    expectations where the markup changed (footer is now a flex column on
    mobile).
7.7 Final pass: `pnpm test` green, `pnpm typecheck` + `pnpm lint` clean,
    `pnpm dev` shows no horizontal scroll at 360 / 768 / 1280 / 1920px.
