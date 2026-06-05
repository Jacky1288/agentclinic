# MVP — Appointments + Staff Dashboard: Plan

Six task groups, in order. Each group is independently demoable:
after group N, the prior groups still work and the app still boots.

## 1. Data model — Prisma schema + migration

1.1 Edit `prisma/schema.prisma`:
    - Add `Status` enum (`booked`, `cancelled`) next to `Severity`.
    - Add `Slot` model: `id` (cuid), `agentId` (FK → `Agent`),
      `startsAt` (DateTime), `createdAt` (default `now()`).
      `@@unique([agentId, startsAt])`, `@@index([startsAt])`.
    - Add `Appointment` model: `id` (cuid), `agentId` (FK), `therapyId`
      (FK), `slotId` (FK), `status` (Status, default `booked`),
      `createdAt`, `updatedAt`. `@@index([slotId])`.
    - Add the reverse relations on `Agent`, `Therapy`, `Slot`
      (`Agent.slots`, `Agent.appointments`, `Therapy.appointments`,
      `Slot.appointments`).
1.2 Add `src/lib/constants.ts` exporting
    `SLOT_DURATION_MINUTES = 30`.
1.3 `pnpm prisma migrate dev --name mvp_appointments` to generate
    the migration. Commit the migration folder.
1.4 `pnpm prisma generate` clean; `src/lib/db.ts` still compiles
    untouched.

## 2. Seed — slots + demo appointments

2.1 Extend `prisma/seed.ts`:
    - After agents are upserted, for each non-archived agent generate
      slots covering **today through today + 2 days**, 09:00–17:00
      local time, at `SLOT_DURATION_MINUTES` intervals. 16 slots ×
      3 days = 48 slots per agent.
    - Use `prisma.slot.upsert` keyed on `(agentId, startsAt)` so
      re-runs on the same calendar day are no-ops, and runs on
      later days additively fill the rolling window.
2.2 Demo appointments:
    - If `await prisma.appointment.count() === 0`, seed ~3–4
      appointments for today and ~2 for tomorrow, spread across
      different agents and therapies. Pick the slots by
      `findFirst({ where: { agentId, startsAt: { gte: ... } }})`.
    - All seeded appointments are `status: 'booked'`.
2.3 Run `pnpm prisma db seed` — confirm `Slot` and `Appointment`
    tables populate. A second run leaves row counts unchanged.

## 3. Queries + validation schemas

3.1 `src/lib/queries/slots.ts` — `listAvailableSlots({ agentId })`:
    select slots for `agentId` where `startsAt >= now()` AND no
    appointment with `status = 'booked'` references the slot
    (Prisma: `where: { appointments: { none: { status: 'booked' } } }`).
    Order by `startsAt`. Include nothing.
3.2 `src/lib/queries/appointments.ts`:
    - `listTodaysAppointments()` — booked appointments where
      `slot.startsAt` is between today 00:00 and tomorrow 00:00
      (local). Include `agent`, `therapy`, `slot`. Order by
      `slot.startsAt`.
    - `listUpcomingByDay({ days })` — returns
      `Array<{ date: Date; count: number }>` for the next `days`
      days, computed with a single `groupBy` on slot date or a
      simple in-JS bucketing of one `findMany`.
3.3 `src/lib/validation/appointment.ts`:
    - `bookAppointmentSchema = z.object({ agentId: z.string().min(1),
      therapyId: z.string().min(1), slotId: z.string().min(1) })`.
    - `cancelAppointmentSchema = z.object({ id: z.string().min(1) })`.

## 4. Public booking flow — `/book` → confirmation

4.1 `src/app/book/page.tsx` — step 1, pick agent.
    - Server component. Lists non-archived agents with name + model
      family as a grid of shadcn `Card`s, each wrapped in a `Link`
      to `/book/<agentId>`. `grid-cols-1 sm:grid-cols-2
      lg:grid-cols-3`.
4.2 `src/app/book/[agentId]/page.tsx` — step 2, pick therapy.
    - Server component. Loads the agent (`notFound()` if missing or
      archived). Header shows agent name. Lists therapies (name,
      duration as `{minutes} min`, description) as cards linking to
      `/book/<agentId>/<therapyId>`.
4.3 `src/app/book/[agentId]/[therapyId]/page.tsx` — step 3, pick
    slot + confirm.
    - Server component. Loads agent + therapy (`notFound()` on
      either). Header shows both names.
    - Calls `listAvailableSlots({ agentId })`. Groups by day with
      a small `groupSlotsByDay` helper in
      `src/lib/queries/slots.ts` (returns `Map<DateKey, Slot[]>`).
    - Renders each day as a section (`Today / Tomorrow /
      <weekday>`); slots render as buttons inside a
      `<form action={bookAppointment}>` with hidden `agentId`,
      `therapyId`, `slotId`. Button label is `HH:mm`.
    - Empty state copy when no slots available: "No openings.
      The agent is booked solid — please try another agent or
      check back tomorrow.".
4.4 `src/app/book/actions.ts` — `bookAppointment`:
    - `'use server'`. Parse input through `bookAppointmentSchema`.
    - In a `prisma.$transaction`: re-check that no booked
      appointment references `slotId`; create the appointment
      (`status: 'booked'`); return the new id.
    - On contention, `redirect` back to step 3 (no flash UI
      needed; the slot will simply be gone from the next render).
    - On success, `redirect('/book/confirmed/' + appointmentId)`.
4.5 `src/app/book/confirmed/[appointmentId]/page.tsx` —
    confirmation.
    - Server component. Loads the appointment with `include: {
      agent, therapy, slot }`. `notFound()` if missing.
    - Renders agent name, therapy name, formatted slot time, a
      satirical confirmation paragraph, and a `Link` back to
      `/book` labelled "Book another".
4.6 `src/components/layout/Header.tsx` — add nav link `/book`
    next to the Phase 1 nav. Stays consistent with the
    mobile-stack / `sm:` row pattern.

## 5. Staff dashboard — `/dashboard`

5.1 `src/app/dashboard/page.tsx` — server component.
    - Loads `listTodaysAppointments()` and `listUpcomingByDay({ days:
      7 })` in parallel via `Promise.all`.
    - Renders three sections inside one responsive grid
      (`grid-cols-1 lg:grid-cols-3 gap-6`):
      1. **Today** (`lg:col-span-2`): shadcn `Table` with columns
         Time / Agent / Therapy / Action. Below `sm:`, swap to a
         stacked card list (same pattern as `/agents`). Empty
         state copy when no appointments today: "No
         appointments today. The agents are recovering.".
      2. **This week** (`lg:col-span-1`): a `Card` with a tiny
         CSS bar chart — one bar per day of the next 7, height
         proportional to the day's count, labelled with the
         weekday letter and the count. Pure flex / divs, no
         chart library.
      3. **Quick links** (`lg:col-span-3`): a row of shadcn
         `Button` links to `/agents`, `/ailments`, `/therapies`,
         `/book`.
5.2 Each Today row's Action column is a
    `<form action={cancelAppointment}>` with a hidden `id` and a
    "Cancel" button. The button uses the shadcn `Button` `variant`
    that reads as destructive without being alarming.
5.3 `src/app/dashboard/actions.ts` — `cancelAppointment`:
    - `'use server'`. Parse input through `cancelAppointmentSchema`.
    - `prisma.appointment.update({ where: { id }, data: { status:
      'cancelled' } })`. `revalidatePath('/dashboard')`.
5.4 Nav: add `/dashboard` to `src/components/layout/Header.tsx`.
    Same responsive pattern.
5.5 Responsive pass: bar chart bars stay readable at 360px (use
    a min-height + min-width per bar so they don't collapse).
    Today table swap mirrors `/agents`.

## 6. Validation harness — Vitest tests for the MVP

6.1 `tests/validation/mvp-appointments-dashboard.test.ts` — file /
    schema checks:
    - `schema.prisma` declares `Slot`, `Appointment` models, the
      `Status` enum, and `Appointment.status` defaults to `booked`.
    - `Slot` has `@@unique([agentId, startsAt])`.
    - `prisma/migrations/` contains a folder ending in
      `_mvp_appointments`.
    - `src/lib/constants.ts` exports `SLOT_DURATION_MINUTES = 30`.
    - `src/lib/queries/slots.ts` and `appointments.ts` exist and
      export the documented helpers.
    - `src/lib/validation/appointment.ts` exists with
      `bookAppointmentSchema` and `cancelAppointmentSchema`.
    - Routes exist: `src/app/book/page.tsx`,
      `src/app/book/[agentId]/page.tsx`,
      `src/app/book/[agentId]/[therapyId]/page.tsx`,
      `src/app/book/confirmed/[appointmentId]/page.tsx`,
      `src/app/dashboard/page.tsx`.
    - Server action files exist: `src/app/book/actions.ts`,
      `src/app/dashboard/actions.ts`, and they import their
      respective Zod schemas.
    - Header includes nav links for `/book` and `/dashboard`.
6.2 `tests/render/dashboard.test.tsx` — renders `/dashboard` with
    stubbed query helpers: today's appointments table shows the
    stubbed agent + therapy names, the upcoming-by-day chart
    renders 7 bars, and the quick-links row contains links to
    `/agents`, `/ailments`, `/therapies`, `/book`.
6.3 `tests/render/book-step3.test.tsx` — renders step 3 with a
    stubbed `listAvailableSlots`: at least one day group renders,
    slot buttons show `HH:mm`, the empty-state copy renders when
    the stub returns no slots.
6.4 `tests/validation/mvp-out-of-scope.test.ts` — encodes the
    out-of-scope guardrail from `validation.md` §6: no
    `src/app/dashboard/agents/[id]/page.tsx`, no Playwright in
    `package.json`, no auth library imported anywhere in `src/`.
6.5 Final pass: `pnpm test`, `pnpm typecheck`, `pnpm lint` all
    clean. `pnpm dev` shows the full flow: pick agent, pick
    therapy, pick slot, see confirmation; then `/dashboard` shows
    the new appointment in Today; cancelling it removes the row
    and re-frees the slot in the booking picker. Hand off to
    `validation.md`.
