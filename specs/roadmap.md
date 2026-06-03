# AgentClinic — Roadmap

Each phase is a **very small vertical slice**: schema + API + UI for one tiny
capability, end-to-end, demoable on its own. Ship the slice, then move on.

## Phase 0 — Skeleton ✅ complete

- Initialize Next.js (App Router) + TypeScript + Tailwind.
- Wire Prisma with an empty schema.
- A single landing page that says "AgentClinic" and explains the joke.
- Goal: `pnpm dev` opens a styled page.
- Shipped on branch `phase-0-skeleton`; see `specs/2026-06-03-skeleton/`.

## Phase 1 — Agents (read-only)

- `Agent` model: id, name, model family, intake date.
- Seed a handful of agents.
- `/agents` page lists them in a table.
- Goal: see real data on screen.

## Phase 2 — Agents (manage)

- Create / edit / archive an agent via server actions.
- Form uses Zod + react-hook-form.
- Goal: staff can add a new patient.

## Phase 3 — Ailments catalog

- `Ailment` model: name, severity, description (the funny copy).
- `/ailments` browse page.
- Goal: the satire lands — visitors can scroll and laugh.

## Phase 4 — Therapies catalog

- `Therapy` model: name, description, duration, ailments it treats (many-to-many).
- `/therapies` browse page; each therapy links to its target ailments.
- Goal: ailments and therapies are connected.

## Phase 5 — Appointments (book)

- `Appointment` model: agent, therapy, time slot, status.
- Public "Book an appointment" flow: pick agent → pick therapy → pick slot → confirm.
- Goal: a stranger can book a fake appointment in under a minute.

## Phase 6 — Staff dashboard

- `/dashboard` shows today's appointments, upcoming load, and quick links.
- Goal: Mary's "dashboard for staff" exists on one screen.

## Phase 7 — Agent dashboard

- `/dashboard/agents/[id]` view: an agent's intake history, current ailments,
  scheduled therapies.
- Goal: the agent-facing dashboard exists too.

## Phase 8 — Polish & demo readiness

- Marketing landing page tightened (Steve's ask).
- Empty states, loading states, error states.
- Playwright smoke test of the booking flow.
- Goal: demo-ready end to end.

## Out of scope (for now)

- Auth, payments, notifications, multi-clinic, real-time updates, mobile apps.
- These come back only if a stakeholder asks.
