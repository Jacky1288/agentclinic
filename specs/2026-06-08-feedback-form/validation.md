# Phase 2 — Feedback form: Validation

How we know this phase is done and ready to merge to `main`.

## Automated checks

All of the following must pass on the `phase-2-feedback` branch before merge:

- `pnpm typecheck` — clean.
- `pnpm lint` — clean.
- `pnpm test` — all suites pass, including:
  - `tests/validation/feedback-schema.test.ts` (Zod schema unit tests)
  - `tests/validation/phase-2-feedback.test.ts` (phase-level structural validation)
  - `tests/render/feedback-form.test.tsx` (form render + submit)
  - `tests/render/dashboard-feedback.test.tsx` (dashboard panel render + empty state)
  - Existing phase-0, phase-1, and MVP suites still pass unchanged.
- `pnpm prisma migrate status` — reports the new `phase2_feedback` migration as applied with no drift.

## Manual smoke (in `pnpm dev`)

1. Visit `/feedback` from a fresh browser session.
2. Submit with an empty subject — see inline validation error, no submission.
3. Submit with subject + message, no contact — see the confirmation state replace the form on the same route.
4. Submit again with subject + message + contact filled.
5. Open `/dashboard`. The "Recent feedback" panel shows both submissions, newest first, with contact present on the second.
6. Resize the browser below the `sm:` breakpoint — panel switches to the stacked-card mobile layout.
7. Toggle dark mode — panel and form respect dark styles, matching the rest of the dashboard.
8. Wipe the `Feedback` table (or run on a fresh DB), reload `/dashboard` — empty state renders with the in-character copy.

## Scope guardrails (must still be true at merge)

Spot-check that the explicit non-goals from [requirements.md](./requirements.md#non-goals-explicit) didn't sneak in:

- No new top-level dependency added to `package.json` (no email lib, no captcha, no rate-limit lib).
- No auth library or middleware added.
- No edit, delete, or status-change action in `src/app/dashboard/`.
- No reply UI or outbound notification anywhere.
- No new fields beyond `subject`, `message`, `contact`, `createdAt`, `id` on the `Feedback` model.

A dedicated test (`tests/validation/phase-2-feedback.test.ts`) should assert at least:
- `package.json` dependency count delta is 0 vs `main`.
- `Feedback` model has exactly the fields listed above and no others.
- No `status` enum addition to `schema.prisma`.

## Docs

- `CHANGELOG.md` has a Phase 2 entry.
- `TODO.md` no longer lists "Feedback form" under `Now`.
- `specs/roadmap.md` does **not** need to change — the phase entry stays as the historical record. (If we *did* change it, that's a constitution edit and should be a separate commit.)

## Merge criteria

- All automated checks above green.
- Manual smoke walked through once on a clean DB.
- Diff reviewed for accidental scope creep against the non-goals list.
- Branch rebased on the latest `main` (or on `mvp` if MVP hasn't landed yet) with no conflicts.
- A single squash-merge commit titled `ship Phase 2: feedback form` lands on `main`.
