# AgentClinic — Roadmap

Each phase is a **very small vertical slice**: schema + API + UI for one tiny
capability, end-to-end, demoable on its own. Ship the slice, then move on.

## Phase 0 — Skeleton ✅ complete

- Initialize Next.js (App Router) + TypeScript + Tailwind.
- Wire Prisma with an empty schema.
- A single landing page that says "AgentClinic" and explains the joke.
- Goal: `pnpm dev` opens a styled page.
- Shipped on branch `phase-0-skeleton`; see `specs/2026-06-03-skeleton/`.

## Phase 1 — Catalogs: Agents (full CRUD), Ailments, Therapies

Combines the four original catalog phases into one slice so the domain
arrives on screen all at once — agents, what's wrong with them, and what
we offer to treat it — instead of dribbling out across four PRs.

- Models:
  - `Agent` — id, name, model family, intake date.
  - `Ailment` — name, severity, description (the funny copy).
  - `Therapy` — name, description, duration, ailments it treats (many-to-many
    with `Ailment`).
- Seed a handful of each.
- `/agents` page lists agents in a table; staff can create / edit / archive
  an agent via server actions; the form uses Zod + react-hook-form.
- `/ailments` browse page lands the satire — visitors can scroll and laugh.
- `/therapies` browse page; each therapy links to its target ailments so
  the relationship is visible.
- Goals (all of):
  - See real agent data on screen.
  - Staff can add a new patient.
  - The joke lands when a stranger scrolls the catalog.
  - Ailments and therapies are connected end-to-end.

## Phase 2 — Appointments (book)

- `Appointment` model: agent, therapy, time slot, status.
- Public "Book an appointment" flow: pick agent → pick therapy → pick slot → confirm.
- Goal: a stranger can book a fake appointment in under a minute.

## Phase 3 — Staff dashboard

- `/dashboard` shows today's appointments, upcoming load, and quick links.
- Goal: Mary's "dashboard for staff" exists on one screen.

## Phase 4 — Agent dashboard

- `/dashboard/agents/[id]` view: an agent's intake history, current ailments,
  scheduled therapies.
- Goal: the agent-facing dashboard exists too.

## Phase 5 — Polish & demo readiness

- Marketing landing page tightened (Steve's ask).
- Empty states, loading states, error states.
- Playwright smoke test of the booking flow.
- Goal: demo-ready end to end.

## Out of scope (for now)

- Auth, payments, notifications, multi-clinic, real-time updates, mobile apps.
- These come back only if a stakeholder asks.
