# Tech Stack

Mary-in-engineering's brief: **a reliable site on a popular TypeScript stack**, with dashboards for agents and staff. Steve-in-marketing's brief: **looks good in a modern browser**. The stack below is chosen to deliver both with the smallest surface area we can get away with.

## Principles

1. **Boring, popular, TypeScript-first.** Every dependency should be searchable on Stack Overflow with thousands of answers.
2. **One way to do each thing.** No parallel state libraries, no two ORMs, no two CSS systems.
3. **Server-first rendering.** Lean on Next.js App Router + Server Components; reach for client interactivity only where it earns its keep.
4. **Don't add to the stack speculatively.** New dependencies wait until the phase that needs them.

## Current stack (locked in)

### Framework & runtime
- **Next.js 16** (App Router) — routing, rendering, server actions.
- **React 19** — UI.
- **TypeScript 5** — strict mode across the project.
- **Node 20+** — runtime baseline.

### Data
- **Prisma 7** — schema, migrations, query layer.
- **better-sqlite3** via `@prisma/adapter-better-sqlite3` — a single-file SQLite DB (`dev.db`) is the only datastore. Good enough through MVP.

### UI & styling
- **Tailwind CSS 3** — styling primitive.
- **class-variance-authority** + **tailwind-merge** + **clsx** — component variant management.
- No component library yet; bespoke components in `src/components/`.

### Forms & validation
- **react-hook-form** + **@hookform/resolvers** — form state.
- **Zod 4** — schema validation, shared between server actions and forms.

### Tooling
- **pnpm** (workspace-enabled) — package manager.
- **ESLint 9** + `eslint-config-next` — lint.
- **Vitest 4** — unit + render tests (see `tests/`).
- **tsx** — running TS scripts (seed, etc.).

## Stack gaps — explicitly deferred

The TODO mentions a feedback form, customer reviews, and an About page with a map. Each of those *could* pull a new dependency into the stack. **We are not adding any of them to the constitution yet.** Each phase that needs one will justify it then:

- **Email / notification provider** — deferred until the feedback form actually needs outbound delivery. Until then, feedback writes to the DB and is read from the dashboard.
- **Map provider** — deferred until the About page is being implemented. Default lean: Leaflet + OpenStreetMap (no API key, no billing), but the decision is made in that phase's spec, not here.
- **Auth** — deferred. The staff dashboard is gated by obscurity for now; real auth lands when the dashboard has anything sensitive enough to warrant it.

If a phase wants to add a new top-level dependency, that's a constitution-level decision and should update this file.

## Project structure (current)

```
src/
  app/              # Next.js App Router routes
    agents/         # Agent catalog
    ailments/       # Ailment catalog
    therapies/      # Therapy catalog
    book/           # Booking flow
    dashboard/      # Staff dashboard
  components/       # Shared UI components
  lib/
    queries/        # Prisma query helpers (agents, therapies, slots, appointments)
    validation/     # Zod schemas
    constants.ts
prisma/
  schema.prisma
  seed.ts
  migrations/
tests/
  render/           # Component render tests
  validation/       # Phase validation tests
```

## Browser support

Modern evergreen browsers (latest two versions of Chrome, Safari, Firefox, Edge). No IE, no polyfills for dead runtimes.
