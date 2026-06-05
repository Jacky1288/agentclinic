# Phase 1 — Catalogs: Requirements

## Scope

Land the domain on screen in one slice: **agents**, **ailments**, and
**therapies**, with the relationship between therapies and ailments visible
both ways. Staff get full CRUD over agents; ailments and therapies arrive
via seed and render read-only this phase. By the end, a stranger can scroll
the catalog and laugh, and staff can add a new patient.

## In scope

### Data model (Prisma, SQLite)

- `Agent`
  - `id` (cuid), `name`, `modelFamily` (string, e.g. "Claude", "GPT", "Llama"),
    `intakeDate` (DateTime, defaults to `now()`).
  - `archivedAt` (DateTime, nullable) — soft archive flag (see Key decisions).
  - `createdAt`, `updatedAt`.
- `Ailment`
  - `id` (cuid), `name` (unique), `severity` (enum: `mild | moderate | severe`),
    `description` (the funny copy).
  - `createdAt`, `updatedAt`.
- `Therapy`
  - `id` (cuid), `name` (unique), `description`, `durationMinutes` (Int).
  - `createdAt`, `updatedAt`.
- `TherapyAilment` — explicit join table for the many-to-many
  (`therapyId`, `ailmentId`, composite PK). Explicit join makes the
  relationship easy to read in the schema and easy to render both ways in
  the UI.

### Seed data

- Seed script at `prisma/seed.ts`, wired through `package.json` (`prisma.seed`).
- ~6 agents, ~6 ailments, ~5 therapies, with a handful of therapy↔ailment
  links so both directions of the relationship show real content on screen.
- Seed is **idempotent**: re-running it does not duplicate rows (upsert by
  unique `name`).

### Routes / UI

- `/agents` (staff)
  - Table of non-archived agents: name, model family, intake date, action
    column (Edit, Archive).
  - "New agent" button → `/agents/new`.
  - Optional "Show archived" toggle (query param) flips the list to archived
    rows; archived rows expose an "Unarchive" action.
- `/agents/new` — create form (server action).
- `/agents/[id]/edit` — edit form (server action). Same form component
  reused with prefilled values.
- `/ailments` (public browse)
  - Card or row list of every ailment: name, severity badge, description.
  - Each ailment lists the **therapies that treat it** as linked chips
    (reverse of the M2M).
- `/therapies` (public browse)
  - Card or row list of every therapy: name, duration, description.
  - Each therapy lists the **ailments it treats** as linked chips.
- Nav: header gets links to `/agents`, `/ailments`, `/therapies`. The
  landing page (`/`) stays as-is and links into the three catalogs from
  the existing CTAs / body copy.

### Forms / validation

- One Zod schema per mutation (`createAgentSchema`, `updateAgentSchema`,
  `archiveAgentSchema`) in `src/lib/validation/agent.ts`. Reused by both
  server action and `react-hook-form`.
- `react-hook-form` + `@hookform/resolvers/zod` on the client; server
  action re-validates with the same schema before calling Prisma.
- shadcn/ui primitives land here for the first time: `Button`, `Input`,
  `Label`, `Table`, `Badge`, `Card`. Install via the shadcn CLI in
  Group 2.

### Responsive

- `/agents` table collapses to a stacked card list below `sm:` (each row
  becomes a card with label/value pairs); table layout from `sm:` up.
- `/ailments` and `/therapies` browse pages are one column on phones,
  two columns from `sm:`, three from `lg:`. Severity badges and chip
  links wrap rather than overflow.
- No horizontal scroll at 360 / 768 / 1280 / 1920px on any of the new
  routes.

## Out of scope (this phase)

- Staff CRUD for ailments and therapies — they're seeded canon for now.
  When a stakeholder asks for in-app management, it becomes a new phase.
- Appointments / booking. Phase 2.
- Auth on the staff routes. The whole app is unauthenticated this phase;
  `/agents` is "staff" by URL convention, not by access control.
- Real-time updates, optimistic UI, toast notifications.
- Pagination, search, filtering on the catalogs. With seeded data in the
  single digits, none of these earn their complexity.
- A dedicated `/catalog` matrix page — the relationship is visible from
  both `/ailments` and `/therapies`, which is enough.

## Key decisions

- **Ailments + therapies are seed-only this phase.** The roadmap only
  calls out browse pages for them; full staff CRUD on three models in one
  slice triples the form surface area and dilutes the demo. Agents get
  the full CRUD treatment so the "staff can add a new patient" goal is
  hit end-to-end. *(User decision, asked at spec time.)*
- **Soft archive via `archivedAt` timestamp**, not a status enum, not a
  hard delete. Later phases (appointments, agent dashboard) will want to
  reference historical agents; preserving rows is the cheapest way to keep
  that door open. A nullable timestamp doubles as "when was this
  archived?" for free. *(User decision.)*
- **Dedicated routes for agent forms** (`/agents/new`,
  `/agents/[id]/edit`) over inline dialog / drawer. The repo is a
  teaching example — every URL maps to one screen and one server action,
  which reads cleanly in the spec and in the file tree. *(User
  decision.)*
- **Both directions of the therapy↔ailment relationship are visible in
  the UI.** The roadmap calls for therapy→ailment links; rendering the
  reverse on `/ailments` is one extra Prisma include and makes the
  catalog feel like a real connected dataset rather than a list and an
  unreachable lookup. *(User decision.)*
- **Explicit join table (`TherapyAilment`) over Prisma's implicit M2M.**
  Explicit join shows up in `schema.prisma` as a named model, which is
  easier to reason about and easier to seed deterministically.
- **shadcn/ui arrives now.** Phase 0 deferred it because the landing page
  was one heading and one paragraph; this phase brings tables and forms,
  which is exactly the shape shadcn primitives are built for.
- **Validation tests in `tests/validation/phase-1-catalogs.test.ts`.**
  Same pattern as Phase 0: file-and-schema checks in Vitest, with the
  visual / cold-start checks called out as manual in `validation.md`.

## Context

- Source of truth: `specs/roadmap.md` (Phase 1), `specs/mission.md`,
  `specs/tech-stack.md`.
- Phase 0 (`specs/2026-06-03-skeleton/`) is shipped: Next.js + Tailwind +
  Prisma + MainLayout chassis + Vitest harness. The empty Prisma schema
  is the canvas this phase paints on.
- Audience the slice must serve, restated from [[mission]]: course
  students reading the diff as a worked example, and booth demoers who
  want to scroll a catalog with a passerby and have the joke land in
  five seconds.
