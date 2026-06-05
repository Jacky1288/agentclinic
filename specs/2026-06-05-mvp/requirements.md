# MVP — Appointments + Staff Dashboard: Requirements

## Scope

Land the two roadmap goals that make AgentClinic an end-to-end demo: a
stranger can **book a fake appointment in under a minute**, and staff
can **see today's schedule on one screen**. This is the union of
roadmap Phases 2 and 3, shipped as one slice so the booking flow has a
dashboard to land in and the dashboard has real data to show.

After this MVP merges, the success criteria from `specs/mission.md` are
met: passerby grasps the joke, books an appointment; staff loads
`/dashboard` and sees today's load. Phases 4 (per-agent dashboard) and
5 (polish + Playwright) remain explicitly deferred.

## In scope

### Data model (Prisma, SQLite)

Extends the Phase 1 schema. No changes to `Agent`, `Ailment`, `Therapy`,
`TherapyAilment`.

- `Slot`
  - `id` (cuid), `agentId` (FK → `Agent`), `startsAt` (DateTime),
    `createdAt`.
  - `@@unique([agentId, startsAt])` — one slot per agent per moment.
  - Index on `startsAt` for the dashboard's "today" query.
  - Slot duration is a constant (`SLOT_DURATION_MINUTES = 30`) in
    `src/lib/constants.ts`, not a column — every slot in the MVP is
    half an hour and the spec doesn't need to defend a variable
    duration.
- `Appointment`
  - `id` (cuid), `agentId` (FK), `therapyId` (FK), `slotId` (FK),
    `status` (enum: `booked | cancelled`, default `booked`),
    `createdAt`, `updatedAt`.
  - Index on `slotId` for the "is this slot taken?" check; not unique
    (cancellation leaves the row in place, so the same slot can
    accumulate multiple rows across a cancel + rebook lifecycle).
- `Status` enum: `booked | cancelled`. Lives next to `Severity` in
  `schema.prisma`.

### Seed data (extends `prisma/seed.ts`)

- For every non-archived agent, generate half-hour slots covering
  **today through today + 2 days, 09:00–17:00 local time** (16 slots ×
  3 days = 48 slots per agent). Upsert keyed on `(agentId, startsAt)`
  so re-running mid-day is a no-op for today's slots and additive once
  the calendar rolls forward.
- Seed a handful of demo appointments (~3–4 today, ~2 tomorrow) so
  `/dashboard` is non-empty on first run. Demo appointments are seeded
  **only if** `await prisma.appointment.count() === 0`; this preserves
  the existing idempotency contract without inventing a synthetic
  unique key.
- No cancelled appointments in seed — the dashboard's cancel button
  is the only way they appear, which keeps the demo flow legible.

### Routes / UI

- `/book` — Step 1, pick agent.
  - Server component. Lists non-archived agents (cards or a select)
    with name + model family. Clicking an agent navigates to
    `/book/<agentId>`.
- `/book/[agentId]` — Step 2, pick therapy.
  - Server component. Shows the agent's name as the header. Lists
    therapies (name, duration, short description) as a clickable
    grid. Clicking a therapy navigates to
    `/book/<agentId>/<therapyId>`.
  - `notFound()` if the agent is missing or archived.
- `/book/[agentId]/[therapyId]` — Step 3, pick slot + confirm.
  - Server component. Shows agent + therapy summary at the top.
    Lists available slots (grouped by day, `Today / Tomorrow /
    <weekday>`) as buttons. Each button is a `<form>` posting to the
    `bookAppointment` server action with `agentId`, `therapyId`,
    `slotId`. On success the action redirects to
    `/book/confirmed/<appointmentId>`.
  - "Available" means: no `Appointment` with `status = 'booked'`
    referencing this slot.
  - `notFound()` if either ID is missing.
- `/book/confirmed/[appointmentId]` — Confirmation.
  - Server component. Renders agent name, therapy name, slot time,
    and a "Book another" link back to `/book`. Plays the satire one
    more time in the copy ("Your agent's session is confirmed.
    Please ensure their context window is fully hydrated before
    arrival.").
- `/dashboard` (staff) — Today + upcoming.
  - Server component. Three sections, stacked on mobile,
    side-by-side from `lg:`:
    1. **Today** — table of today's booked appointments (time,
       agent, therapy, cancel action). Empty state copy:
       "No appointments today. The agents are recovering.".
    2. **This week** — small summary card: counts of booked
       appointments for next 7 days, broken down by day, rendered
       as a tiny bar chart (CSS only, no chart library).
    3. **Quick links** — buttons to `/agents`, `/ailments`,
       `/therapies`, `/book`.
  - Cancel is a `<form>` per row posting to `cancelAppointment` with
    `id`; server action flips status to `cancelled` and revalidates
    `/dashboard`.

### Forms / validation / server actions

- `src/lib/validation/appointment.ts` exports:
  - `bookAppointmentSchema` — `{ agentId, therapyId, slotId }`
    (all required, non-empty strings).
  - `cancelAppointmentSchema` — `{ id }`.
- `src/app/book/actions.ts` — `bookAppointment` server action.
  - Parses input through `bookAppointmentSchema`.
  - In a single Prisma transaction: re-checks that the slot has no
    booked appointment, then creates the appointment. Returns the
    new id for the redirect.
  - On contention ("slot was just taken"), returns `notFound()` /
    redirects back to step 3 with a flash query param —
    implementation can keep this lightweight; the demo race is
    unlikely.
- `src/app/dashboard/actions.ts` — `cancelAppointment` server action.
  - Parses input, sets `status = 'cancelled'`, revalidates
    `/dashboard`.
- The booking flow uses **no client components**. Each step is a
  server-rendered page; submissions are plain `<form>` posts to
  server actions. `react-hook-form` doesn't earn its keep here — the
  Phase 1 agent forms still use it.

### Queries

- `src/lib/queries/slots.ts` — `listAvailableSlots({ agentId })`
  returns slots for `agentId` from now forward where no `Appointment`
  with `status = booked` references the slot, ordered by `startsAt`.
- `src/lib/queries/appointments.ts`:
  - `listTodaysAppointments()` — booked appointments where
    `slot.startsAt` falls within today, ordered by time, includes
    `agent` + `therapy` + `slot`.
  - `listUpcomingByDay({ days })` — returns `[{ date, count }]` for
    the next `days` days for the dashboard summary card.

### Responsive

- `/book` step pages: agent / therapy / slot lists are
  `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`. Slot buttons (step 3)
  reach a 44px tap target on mobile.
- `/dashboard`: stacked single column below `lg:`; table → card
  stack swap on the today list below `sm:` (same pattern as
  `/agents`).
- No horizontal scroll at 360 / 768 / 1280 / 1920px on any new route.

## Out of scope (this MVP)

- **Phase 4 agent dashboard** (`/dashboard/agents/[id]`). The MVP
  hits the two top-line success criteria; the per-agent face waits
  for a stakeholder ask.
- **Phase 5 polish.** Marketing landing tightening, Playwright
  smoke test, exhaustive empty / loading / error states — all
  deferred. The MVP ships with minimal empty-state copy on
  `/dashboard` and `/book` step 3 (when no slots are available)
  and nothing more.
- **Auth.** `/dashboard` stays unauthenticated, same as `/agents`
  in Phase 1.
- **Editing an existing appointment.** Cancel + rebook is the
  whole lifecycle this phase.
- **Staff-initiated booking from `/dashboard`.** Booking is a
  public-flow concept this MVP; if staff want to book on behalf
  of an agent, they use `/book` like anyone else.
- **Real-time updates, optimistic UI, toast notifications,
  email confirmations.**
- **Pagination, search, filtering** on appointments. With seed
  data in single digits per day, plain queries are fine.
- **Notifications when a slot races out from under you.** The
  server action handles contention by re-rendering step 3 with a
  fresh slot list; designing a fancier UX for this isn't worth
  the spec line.

## Key decisions

- **Phases 2 and 3 ship together as one MVP slice, deferring 4 and
  5.** The roadmap's success metric is *demoable end-to-end*; the
  passerby story needs booking, the booth story needs a staff
  screen, and shipping them in one branch means the dashboard has
  real appointments to render on day one instead of waiting for
  Phase 2's data to back into it. *(User decision.)*
- **Seeded fixed `Slot` rows over generated-from-working-hours or
  free-form datetimes.** Slots are visible in the database, the
  picker is a list of obvious times, and the "is this slot taken?"
  check is a row-exists query. Reads cleanly in the spec; the
  teaching repo doesn't need calendar math. *(User decision.)*
- **Booker picks an existing seeded agent — no inline create, no
  anonymous booking.** Reuses Phase 1's agent catalog, avoids
  adding a public write path to the `Agent` table, and the
  dropdown of seeded names like "Claude-3-Opus" is the moment the
  joke lands in a demo. *(User decision.)*
- **Multi-URL booking flow (`/book` → `/book/[agentId]` →
  `/book/[agentId]/[therapyId]` → `/book/confirmed/[id]`) over a
  single-page stepper.** Each URL maps to one page and one server
  action, which reads cleanly in the spec and in the file tree —
  same principle that put `/agents/new` and `/agents/[id]/edit`
  on their own pages in Phase 1.
- **Soft-cancel via `status` enum, not a hard delete.** The
  roadmap calls for status; keeping cancelled rows preserves
  cancellation history for the staff dashboard if a future
  phase wants to surface it. The price is that `slotId` can't be
  uniquely constrained — the server action enforces "one booked
  appointment per slot" in a transaction instead.
- **No `react-hook-form` in the booking flow.** Every step is a
  click-to-submit `<form>`; no text input to validate beyond what
  Zod handles on the server. Adds zero client JS to the public
  flow.
- **Slot duration as a constant, not a column.** Half-hour slots
  are the only kind the MVP ships; making it variable would mean
  the picker has to render varying-height blocks and the spec has
  to defend the choice. When variable durations become real, the
  column lands then.
- **Seed appointments are guarded by `count() === 0`, not by an
  upsert.** Appointments don't have a natural composite key
  (cancellation rules it out), so the simplest idempotency story
  is "don't seed if any appointments exist" — same shape as Phase
  1's "fresh DB, fresh seed" expectation.
- **Validation tests in
  `tests/validation/mvp-appointments-dashboard.test.ts`.** Same
  pattern as Phases 0 and 1: file / schema checks in Vitest, the
  visual + cold-start checks called out as manual in
  `validation.md`.

## Context

- Source of truth: `specs/roadmap.md` (Phases 2 + 3),
  `specs/mission.md`, `specs/tech-stack.md`.
- Phase 1 (`specs/2026-06-05-catalogs/`) is shipped: agents, ailments,
  therapies, the M2M between them, shadcn primitives, and the
  validation harness. This MVP paints `Slot` and `Appointment` on top
  of that schema without touching the Phase 1 models.
- Audience the slice must serve, restated from [[mission]]: a course
  student reading the diff as a worked example, and a booth demoer
  who wants the passerby to book a fake appointment in five clicks
  and then flip to `/dashboard` and see it land.
