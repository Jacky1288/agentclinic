# Phase 1 — Catalogs: Validation

Phase 1 can merge when **all** of the following hold on a fresh clone.

The file / schema / wiring checks are encoded as Vitest tests in
`tests/validation/phase-1-catalogs.test.ts` plus the render tests under
`tests/render/`. Run them with:

```bash
pnpm test
```

A green `pnpm test` is the single landing gate for the encoded sections
(2 partial, 4, 5, 6). The command-style and visual checks (sections 1
and 3, plus the responsive sweep in §2) are run by hand against a fresh
clone — they shell out or require an eye on screen, and aren't worth
encoding.

## 1. Setup works cold *(manual)*

```bash
pnpm install
pnpm prisma migrate deploy   # applies the catalogs migration
pnpm prisma db seed          # populates ailments, therapies, agents
pnpm dev
```

- `prisma migrate deploy` applies the `*_catalogs` migration cleanly.
- `prisma db seed` populates three tables; a second run leaves row
  counts unchanged (idempotent seed).
- `pnpm dev` starts the Next.js server with no console errors on the
  three new routes.

## 2. The roadmap goals are met

All four Phase 1 goals from `specs/roadmap.md` must hold:

### 2a. See real agent data on screen *(Vitest + visual)*

- `/agents` lists the seeded agents in a table (≥ `sm:`) / card stack
  (< `sm:`) with name, model family, intake date. *(Vitest: render test
  asserts seeded names.)*

### 2b. Staff can add a new patient *(manual)*

- Clicking "New agent" navigates to `/agents/new`, the form accepts
  name + model family + intake date, submitting redirects back to
  `/agents`, and the new row is visible at the top of the list.
- Editing an existing agent from `/agents/[id]/edit` persists the
  change and reflects on `/agents` immediately
  (`revalidatePath('/agents')`).
- Archiving a row hides it from the default `/agents` view; the
  "Show archived" toggle (`?archived=1`) brings it back with an
  Unarchive action that restores it.

### 2c. The joke lands when a stranger scrolls the catalog *(manual)*

- A passerby reading `/ailments` cold gets the satire in roughly five
  seconds: severity badges, names like "Prompt fatigue", and
  description copy that plays the joke straight.
- `/therapies` reads the same way — names land the bit, durations
  ground it in clinic-speak ("45 min", "30 min").

### 2d. Ailments and therapies are connected end-to-end *(Vitest + visual)*

- Each card on `/therapies` lists the ailments it treats as linked
  chips; clicking one scrolls to the matching ailment card on
  `/ailments`.
- Each card on `/ailments` lists the therapies that treat it as linked
  chips; clicking one scrolls to the matching therapy card on
  `/therapies`. *(Vitest: render test asserts at least one chip in
  each direction for a known seeded pair.)*

### Responsive sweep *(manual)*

- `/agents`, `/ailments`, `/therapies`, `/agents/new`, and
  `/agents/[id]/edit` render with **no horizontal scroll** at 360px,
  768px, 1280px, and 1920px viewport widths, and **no console errors**
  at any of them.
- The `/agents` table collapses to a stacked card list below `sm:`
  and presents as a table from `sm:` up.
- Catalog grids are one column below `sm:`, two from `sm:`, three from
  `lg:`.
- Chip links wrap onto multiple rows rather than overflowing their
  card.

## 3. Quality gates are clean *(manual)*

```bash
pnpm typecheck   # tsc --noEmit, strict mode
pnpm lint        # ESLint on .ts/.tsx
```

Both exit 0. No `any` introduced in app code. The forms file uses the
Zod schemas as the single source of truth for both client and server
validation.

## 4. Data model is correct *(Vitest)*

- `prisma/schema.prisma` declares `Agent`, `Ailment`, `Therapy`, and
  `TherapyAilment` models.
- `Agent` has `archivedAt DateTime?` (soft archive, not a hard delete
  or status enum).
- `Severity` enum is declared with values `mild`, `moderate`, `severe`
  and is the type of `Ailment.severity`.
- `Ailment.name` and `Therapy.name` are `@unique`.
- `TherapyAilment` has a composite PK on `(therapyId, ailmentId)` and
  named relations back to both parent models.
- A migration folder ending in `_catalogs` exists under
  `prisma/migrations/`.

## 5. Wiring is correct *(Vitest)*

- shadcn primitives exist at `src/components/ui/{button,input,label,
  table,badge,card}.tsx`; `src/lib/utils.ts` exports `cn`.
- `react-hook-form` and `@hookform/resolvers` are in `package.json`
  dependencies.
- `prisma.seed` in `package.json` points at `tsx prisma/seed.ts`; `tsx`
  is a devDependency.
- Routes exist: `src/app/agents/page.tsx`,
  `src/app/agents/new/page.tsx`, `src/app/agents/[id]/edit/page.tsx`,
  `src/app/ailments/page.tsx`, `src/app/therapies/page.tsx`.
- Zod schemas exist at `src/lib/validation/agent.ts` and are imported
  by the server actions file (`src/app/agents/actions.ts`).
- `src/components/layout/Header.tsx` contains nav links to `/agents`,
  `/ailments`, and `/therapies`.

## 6. Out-of-scope guardrail *(Vitest)*

The following must **not** exist yet (they belong to later phases):

- Routes for appointments or dashboards (`/appointments`,
  `/dashboard`, `/dashboard/agents/[id]`).
- Staff-facing edit forms for ailments or therapies
  (`src/app/ailments/new`, `src/app/ailments/[id]/edit`,
  `src/app/therapies/new`, `src/app/therapies/[id]/edit`).
- An `Appointment` model in `schema.prisma`.
- An auth library (NextAuth, Lucia, Clerk, etc.) — staff routes are
  unauthenticated this phase.
- Playwright. The e2e gate lands in Phase 5.

If a reviewer finds one of these, it's scope creep — bounce it to the
appropriate phase rather than landing it here.
