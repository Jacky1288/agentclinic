# MVP — Appointments + Staff Dashboard: Validation

The MVP can merge when **all** of the following hold on a fresh clone.

The file / schema / wiring checks are encoded as Vitest tests in
`tests/validation/mvp-appointments-dashboard.test.ts` plus the render
tests under `tests/render/`. Run them with:

```bash
pnpm test
```

A green `pnpm test` is the single landing gate for the encoded sections
(4, 5, 6, and the data-shape checks in §2). The command-style and
visual checks (sections 1 and 3, plus the responsive sweep in §2) are
run by hand against a fresh clone.

## 1. Setup works cold *(manual)*

```bash
pnpm install
pnpm prisma migrate deploy   # applies catalogs + mvp_appointments
pnpm prisma db seed          # populates slots + demo appointments
pnpm dev
```

- `prisma migrate deploy` applies the `*_mvp_appointments` migration
  cleanly on top of the Phase 1 catalogs migration.
- `prisma db seed` populates `Slot` and `Appointment` in addition to
  the Phase 1 tables; a second run leaves row counts unchanged
  (idempotent for slots via `(agentId, startsAt)` upsert, idempotent
  for appointments via `count() === 0` guard).
- `pnpm dev` starts Next.js with no console errors on `/book`,
  `/book/<agentId>`, `/book/<agentId>/<therapyId>`,
  `/book/confirmed/<id>`, or `/dashboard`.

## 2. The MVP goals are met

The two top-line success criteria from `specs/mission.md` and the two
roadmap goals (Phases 2 + 3) must all hold:

### 2a. A stranger books a fake appointment in under a minute *(manual + Vitest)*

- Landing on `/book` cold, a passerby:
  1. Sees a grid of seeded agents (name + model family). Clicks one.
  2. Sees the agent's name and a grid of therapies. Clicks one.
  3. Sees grouped slot buttons (`Today / Tomorrow / <weekday>`),
     each labelled `HH:mm`. Clicks one.
  4. Lands on `/book/confirmed/<id>` with their booking spelled out.
- Total wall-clock time from `/book` to confirmation: **under 60
  seconds** on a 1280px laptop and a 360px phone viewport. Time it
  end-to-end at least once before merging.
- *(Vitest: render test on step 3 asserts that grouped day sections
  render, slot buttons label as `HH:mm`, and the empty-state copy
  renders when no slots are available.)*

### 2b. Staff see today's schedule on one screen *(manual + Vitest)*

- `/dashboard` renders all three sections — Today, This week, Quick
  links — without scrolling on a 1280px viewport.
- Today's table shows the seeded demo appointments (time, agent,
  therapy, cancel action), ordered by time.
- This-week card renders 7 bars; the count on each bar matches the
  number of booked appointments scheduled for that day in seed.
- Quick-links row contains buttons to `/agents`, `/ailments`,
  `/therapies`, `/book`. *(Vitest: render test asserts each link
  is present.)*

### 2c. Booking and the dashboard are connected end-to-end *(manual)*

- Booking an appointment via `/book` results in a new row in
  `/dashboard` → Today within a refresh (server action calls
  `revalidatePath('/dashboard')` indirectly via the next page load
  on the dashboard).
- Cancelling an appointment from `/dashboard` removes it from the
  Today table and re-opens its slot in the booking step-3 picker.
- An archived agent (`/agents?archived=1`) does **not** appear on
  `/book` step 1, and their slots do not appear in the booking
  picker even if reached directly via URL — `notFound()` on archived
  in step 2.

### Responsive sweep *(manual)*

- `/book`, `/book/<agentId>`, `/book/<agentId>/<therapyId>`,
  `/book/confirmed/<id>`, and `/dashboard` render with **no
  horizontal scroll** at 360px, 768px, 1280px, and 1920px viewport
  widths, and **no console errors** at any of them.
- The `/dashboard` Today table collapses to a stacked card list
  below `sm:`.
- The booking step grids are one column below `sm:`, two from
  `sm:`, three from `lg:`.
- The this-week bar chart on `/dashboard` stays readable at 360px
  (bars have a minimum visible height + width).
- Slot buttons on step 3 reach a 44px tap target on mobile.

## 3. Quality gates are clean *(manual)*

```bash
pnpm typecheck   # tsc --noEmit, strict mode
pnpm lint        # ESLint on .ts/.tsx
```

Both exit 0. No `any` introduced in app code. The Zod schemas in
`src/lib/validation/appointment.ts` are the single source of truth
for both client-side `<form>` field names and server-side
re-validation.

## 4. Data model is correct *(Vitest)*

- `prisma/schema.prisma` declares `Slot` and `Appointment` models
  and the `Status` enum (`booked`, `cancelled`).
- `Slot` has `@@unique([agentId, startsAt])` and an index on
  `startsAt`.
- `Appointment.status` defaults to `booked`.
- `Appointment` has FKs to `Agent`, `Therapy`, and `Slot`, with
  named relations.
- A migration folder ending in `_mvp_appointments` exists under
  `prisma/migrations/`.
- The Phase 1 models (`Agent`, `Ailment`, `Therapy`,
  `TherapyAilment`) are **unchanged** by this phase — diff the
  schema against `main` to confirm.

## 5. Wiring is correct *(Vitest)*

- `src/lib/constants.ts` exports `SLOT_DURATION_MINUTES = 30`.
- `src/lib/queries/slots.ts` exports `listAvailableSlots`.
- `src/lib/queries/appointments.ts` exports
  `listTodaysAppointments` and `listUpcomingByDay`.
- `src/lib/validation/appointment.ts` exports
  `bookAppointmentSchema` and `cancelAppointmentSchema`.
- Routes exist:
  - `src/app/book/page.tsx`
  - `src/app/book/[agentId]/page.tsx`
  - `src/app/book/[agentId]/[therapyId]/page.tsx`
  - `src/app/book/confirmed/[appointmentId]/page.tsx`
  - `src/app/dashboard/page.tsx`
- Server action files exist and import their Zod schemas:
  - `src/app/book/actions.ts` imports `bookAppointmentSchema`.
  - `src/app/dashboard/actions.ts` imports
    `cancelAppointmentSchema`.
- `src/components/layout/Header.tsx` contains nav links to
  `/book` and `/dashboard` in addition to the Phase 1 links.

## 6. Out-of-scope guardrail *(Vitest)*

The following must **not** exist yet (they belong to later phases):

- Per-agent dashboard routes: no
  `src/app/dashboard/agents/[id]/page.tsx`. (Phase 4.)
- Playwright: `package.json` does **not** depend on
  `@playwright/test`; no `playwright.config.ts`. (Phase 5.)
- An auth library: no `next-auth`, `lucia-auth`, `@clerk/nextjs`,
  or `iron-session` in `package.json`; no `import` of any of them
  in `src/`.
- Staff-facing edit forms for ailments or therapies (still
  deferred from Phase 1):
  - `src/app/ailments/new`, `src/app/ailments/[id]/edit`,
    `src/app/therapies/new`, `src/app/therapies/[id]/edit`
    must not exist.
- Staff-initiated booking from `/dashboard`: no
  `src/app/dashboard/book` route or equivalent in-dashboard
  form. Booking flows through `/book`.

If a reviewer finds one of these, it's scope creep — bounce it to
the appropriate phase rather than landing it here.
