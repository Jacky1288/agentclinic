# Phase 2 — Feedback form: Plan

Implementation order. Each numbered group is a coherent unit you could pause after without leaving the tree broken.

## 1. Data model + migration

1. Add `Feedback` model to `prisma/schema.prisma` (fields per [requirements.md](./requirements.md#data-model)).
2. Run `pnpm prisma migrate dev --name phase2_feedback` to generate the migration under `prisma/migrations/`.
3. Add a small seed block to `prisma/seed.ts` — ~5 in-character but neutral-toned entries so the dashboard panel has content in dev.
4. Re-run the seed and verify rows land in `dev.db`.

## 2. Validation schema

1. Create `src/lib/validation/feedback.ts` exporting a Zod schema for `{ subject, message, contact? }` per the field table.
2. Export an inferred `FeedbackInput` type for reuse on both client and server.
3. Add a unit test at `tests/validation/feedback-schema.test.ts` covering: happy path, each required field missing, length boundaries (3/120 for subject, 10/2000 for message, 200 for contact), contact omitted vs empty-string.

## 3. Query helper

1. Create `src/lib/queries/feedback.ts` with:
   - `createFeedback(input: FeedbackInput)` — writes a row.
   - `listRecentFeedback({ limit = 20 })` — returns newest-first, with a stable `FeedbackRow` type for components to consume.
2. Mirror the structure of `src/lib/queries/appointments.ts` (named return types, no Prisma types leaking into pages).

## 4. Public form page

1. Create `src/app/feedback/page.tsx` — server component, marketing-style header + the form below.
2. Create `src/app/feedback/actions.ts` exporting `submitFeedback` server action. It:
   - Parses `FormData` with the Zod schema.
   - On invalid input, returns a typed `{ ok: false, errors }` result.
   - On success, calls `createFeedback`, then `revalidatePath("/dashboard")`, and returns `{ ok: true }`.
3. Create `src/app/feedback/feedback-form.tsx` (client component) using `react-hook-form` + `@hookform/resolvers/zod` against the shared schema. On success, swap the form for a confirmation message in-place.
4. Add a header link to `/feedback` in `src/components/layout/Header.tsx`.

## 5. Dashboard panel

1. Extend `src/app/dashboard/page.tsx` to call `listRecentFeedback({ limit: 20 })` in parallel with the existing queries.
2. Add a new full-width `Card` below the existing grid: title "Recent feedback", description "The latest 20 submissions, newest first."
3. Render as:
   - Mobile: stacked list of cards (subject + relative time + truncated message + contact if present).
   - `sm:` and up: `Table` with columns `When` / `Subject` / `Message` (truncated) / `Contact`.
4. Match the existing empty-state pattern (dashed border, muted text) with the in-character empty copy from requirements.

## 6. Tests

1. `tests/validation/phase-2-feedback.test.ts` — phase-level structural validation:
   - `Feedback` model exists with the expected columns.
   - The migration file is present.
   - `/feedback` route file exists; `feedback` query helper exports the two named functions.
2. `tests/render/feedback-form.test.tsx` — renders the form, asserts required fields are present and required, submits via fake action, asserts confirmation state replaces the form.
3. `tests/render/dashboard-feedback.test.tsx` — renders the dashboard with stub feedback rows and asserts the panel + empty-state path.

## 7. Glue + housekeeping

1. Update `TODO.md`: move "Feedback form" out of `Now`; promote one of the `Next` items.
2. Update `CHANGELOG.md` with a one-line entry for the phase.
3. Run `pnpm typecheck`, `pnpm lint`, `pnpm test` — all green.
4. Manually exercise the flow in `pnpm dev`: submit feedback, see it appear on the dashboard.

## Sequencing notes

- Groups 1 → 2 → 3 are linear (schema unlocks types unlocks queries).
- Groups 4 and 5 can be done in parallel after group 3, but the dashboard panel is easier to demo if the form already works.
- Group 6 tests can be written alongside their corresponding production code, not deferred to the end.
