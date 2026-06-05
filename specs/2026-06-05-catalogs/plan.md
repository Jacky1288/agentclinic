# Phase 1 — Catalogs: Plan

Six task groups, in order. Each group is independently demoable: after
group N, the prior groups still work and the app still boots.

## 1. Data model — Prisma schema + first migration

1.1 Edit `prisma/schema.prisma` to add the three models and the join:
    - `Agent` with `id`, `name`, `modelFamily`, `intakeDate`,
      `archivedAt`, `createdAt`, `updatedAt`.
    - `Ailment` with `id`, `name` (`@unique`), `severity` (enum),
      `description`, `createdAt`, `updatedAt`.
    - `Therapy` with `id`, `name` (`@unique`), `description`,
      `durationMinutes`, `createdAt`, `updatedAt`.
    - `TherapyAilment` join with composite PK (`@@id([therapyId,
      ailmentId])`) and relations back to `Therapy` and `Ailment`.
    - `Severity` enum: `mild | moderate | severe`. (SQLite stores enums
      as strings — Prisma handles the cast.)
1.2 `pnpm prisma migrate dev --name catalogs` to generate the first real
    migration. Commit the migration file.
1.3 Confirm `pnpm prisma generate` still produces a clean client and
    `src/lib/db.ts` still compiles without touching the singleton.

## 2. shadcn/ui — first install

2.1 Run the shadcn init (`pnpm dlx shadcn@latest init`) targeting the
    existing Tailwind config; accept the defaults for the `src/` layout
    so generated files land under `src/components/ui/`.
2.2 Add primitives we need this phase: `button`, `input`, `label`,
    `table`, `badge`, `card`. One `pnpm dlx shadcn add` invocation.
2.3 Wire the generated `cn` helper (`src/lib/utils.ts`) and confirm
    Tailwind picks up the new component files via the existing
    `content` glob (`./src/**/*.{ts,tsx}` already covers them).
2.4 Sanity: `pnpm typecheck` + `pnpm lint` clean; `pnpm dev` still
    serves `/` unchanged.

## 3. Seed — idempotent catalog data

3.1 Add `prisma/seed.ts`:
    - ~6 ailments with funny copy (e.g. "Prompt fatigue",
      "Context exhaustion", "Hallucination flare-up", "Refusal spiral",
      "Token starvation", "Sycophancy creep").
    - ~5 therapies ("Mindful temperature reduction", "Long-context
      sabbatical", "Grounding citations workshop", "Refusal-tone
      retraining", "Cache-warming hydration").
    - ~6 agents across model families.
    - Therapy↔ailment links so every ailment has at least one therapy
      and every therapy treats at least one ailment.
3.2 All writes use `prisma.<model>.upsert` keyed on `name` (or the
    composite key for the join) so re-running the seed is a no-op.
3.3 Wire the seed: `package.json` gets a `prisma.seed` block pointing at
    `tsx prisma/seed.ts`. Add `tsx` to devDependencies.
3.4 Run `pnpm prisma db seed` — confirm three tables populate and a
    second run leaves row counts unchanged.

## 4. Public browse — /ailments and /therapies

4.1 `src/lib/queries/ailments.ts` — `listAilments()` server helper that
    returns ailments with their treating therapies via `include:
    { therapies: { include: { therapy: true } } }`.
4.2 `src/app/ailments/page.tsx` — server component, renders a
    responsive grid of shadcn `Card`s: name, `Badge` for severity,
    description, then a row of linked therapy chips
    (`Link` to `/therapies#therapy-<id>` is fine — no detail pages this
    phase, anchor scroll is enough).
4.3 `src/lib/queries/therapies.ts` — mirror of 4.1 for therapies with
    their ailments.
4.4 `src/app/therapies/page.tsx` — same shape as 4.2: card per therapy
    with duration (`{minutes} min`), description, ailment chips linking
    back to `/ailments#ailment-<id>`.
4.5 Add `id="ailment-<id>"` / `id="therapy-<id>"` on the card wrapper
    in each list so the cross-links land on the right card.
4.6 `src/components/layout/Header.tsx` — add nav links for `/agents`,
    `/ailments`, `/therapies`. Stacks vertically below `sm:`, joins the
    header row from `sm:` up (consistent with Phase 0's responsive
    pattern).
4.7 Responsive pass: grid is `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`,
    chips wrap with `flex flex-wrap gap-2`, no horizontal scroll at any
    target viewport.

## 5. Staff CRUD — /agents list + create + edit + archive

5.1 `src/lib/validation/agent.ts` — Zod schemas:
    - `createAgentSchema` (name min 1, modelFamily min 1, intakeDate
      optional ISO string → defaults to today).
    - `updateAgentSchema` extends create with `id`.
    - `archiveAgentSchema` is `{ id, archive: boolean }` (covers both
      archive and unarchive through one action).
5.2 `src/lib/queries/agents.ts` — `listAgents({ archived }: { archived:
    boolean })` returning ordered by `intakeDate desc`.
5.3 `src/app/agents/actions.ts` — `createAgent`, `updateAgent`,
    `setAgentArchived` server actions. Each parses input through its
    Zod schema, writes via Prisma, then calls `revalidatePath('/agents')`.
5.4 `src/app/agents/page.tsx` — server component:
    - Reads `?archived=1` from `searchParams` to flip the toggle.
    - shadcn `Table` of agents with Edit / Archive (or Unarchive) buttons.
    - "New agent" button linking to `/agents/new`.
    - Below `sm:`, the table swaps for a stacked card list of the same
      rows (Tailwind `hidden sm:table` / `sm:hidden` swap pattern, or a
      separate `<AgentList>` component that picks layout off a media
      query — either is fine, pick the simpler one in implementation).
5.5 `src/components/agents/AgentForm.tsx` — client component (`'use
    client'`) using `react-hook-form` + `zodResolver(createAgentSchema)`.
    Accepts `defaultValues` and an `action` prop so the same form
    drives `/agents/new` and `/agents/[id]/edit`.
5.6 `src/app/agents/new/page.tsx` — renders `<AgentForm
    action={createAgent} />`.
5.7 `src/app/agents/[id]/edit/page.tsx` — loads the agent, renders
    `<AgentForm action={updateAgent} defaultValues={agent} />`.
    Returns `notFound()` if the agent doesn't exist or is archived
    (editing archived rows isn't a flow we want this phase).
5.8 Archive UI: each row's Archive button is a `<form action={...}>`
    posting to `setAgentArchived` with `id` + `archive: true`. The
    "Show archived" view flips to Unarchive (`archive: false`).
5.9 Responsive pass: form inputs stack vertically below `sm:`, sit
    side-by-side from `sm:` up where appropriate (name + modelFamily
    pair nicely as two columns on tablet+). All buttons reach 44px tap
    target on mobile.

## 6. Validation harness — Vitest tests for Phase 1

6.1 `tests/validation/phase-1-catalogs.test.ts` — encode the file /
    schema checks:
    - `schema.prisma` declares `Agent`, `Ailment`, `Therapy`,
      `TherapyAilment` models and the `Severity` enum; `Agent` has
      `archivedAt DateTime?`.
    - Migration directory contains a `*_catalogs` folder.
    - `prisma/seed.ts` exists; `package.json` has `prisma.seed` pointing
      at it; `tsx` is in devDependencies.
    - shadcn primitives (`button`, `input`, `label`, `table`, `badge`,
      `card`) exist under `src/components/ui/`; `src/lib/utils.ts`
      exports `cn`.
    - Zod schemas exist at `src/lib/validation/agent.ts` and are
      imported by the agents action file.
    - Routes exist: `src/app/agents/page.tsx`, `src/app/agents/new/page.tsx`,
      `src/app/agents/[id]/edit/page.tsx`, `src/app/ailments/page.tsx`,
      `src/app/therapies/page.tsx`.
    - `react-hook-form` and `@hookform/resolvers` are installed.
    - Header includes nav links for the three new routes.
6.2 `tests/render/` gets one render test per browse page: the seeded
    ailment / therapy names appear, and a known ailment's card shows at
    least one therapy chip (and vice-versa) so the bidirectional M2M is
    actually wired.
6.3 `tests/render/agents-list.test.tsx` — renders the agents page with a
    stubbed query helper, asserts the table shows seeded names and the
    "New agent" link is present. Tests for the form component live next
    to it (`agents-form.test.tsx`) and exercise Zod-rejection on an
    empty name.
6.4 Final pass: `pnpm test`, `pnpm typecheck`, `pnpm lint` all clean.
    `pnpm dev` shows `/agents`, `/ailments`, `/therapies` working,
    with an archived agent visible behind `?archived=1`. Hand off to
    `validation.md`.
