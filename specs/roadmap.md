# Roadmap

High-level implementation order, derived from `TODO.md` and the current state of the repo. Each phase is intentionally small — one focused outcome, shippable on its own, with its own `specs/<date>-<phase>/` folder when work begins.

## Where we are

Already shipped (visible in `git log` and current `src/`):
- **Phase 0 — Skeleton.** Next.js + Prisma + Tailwind scaffolding, base layout, header.
- **Phase 1 — Catalogs.** Agents CRUD; ailments and therapies browse pages.
- **MVP — Appointments + Staff dashboard.** Booking flow (`/book`), appointment queries, staff dashboard (`/dashboard`). In progress on the `mvp` branch.

Everything below is *new* work, in the order we plan to tackle it.

---

## Now

### Phase 2 — Feedback form

**Outcome:** A visitor can submit free-text feedback from a public page; staff can see submissions in the dashboard.

- New route: `/feedback` with a simple form (subject, message, optional contact).
- Zod schema + server action; writes to a new `Feedback` table via Prisma.
- Dashboard gets a "Feedback" panel listing recent submissions.
- No outbound email yet — submissions live in the DB only. (See [tech-stack.md](tech-stack.md) on deferred email.)
- Validation tests for the schema; render test for the form.

---

## Next

### Phase 3 — Customer reviews

**Outcome:** Visitors can read short reviews on therapy pages; staff can add/curate reviews from the dashboard.

- New `Review` table linked to `Therapy` (rating 1–5, author display name, body, published flag).
- Reviews render on each `/therapies/[slug]` page (published only).
- Dashboard gets a Reviews panel with publish/unpublish toggle.
- Seed a handful of in-character reviews so the pages look populated.
- No public submission flow in this phase — staff-curated only, to keep moderation out of scope.

### Phase 4 — About us page (with address + map)

**Outcome:** A polished `/about` page that tells the clinic's story and shows where to find us.

- Static content section: clinic story, team bios (in character), hours.
- Address block with structured data.
- Embedded map. Default proposal: **Leaflet + OpenStreetMap** (no API key, no billing). Locked in during this phase's spec.
- This is the first phase where Steve-in-marketing's "attractive site" brief gets a dedicated canvas — design polish lives here.

---

## Later (not committed)

Things we've talked about but haven't scoped:
- Email/notification delivery for feedback submissions.
- Real staff auth on the dashboard.
- Public review submission with moderation.

These will get their own phases if and when they earn priority.

---

## How phases work

- One phase = one folder under `specs/YYYY-MM-DD-<slug>/` with `requirements.md`, `plan.md`, and `validation.md`.
- A phase is "done" when its validation tests pass and it's merged to `main`.
- Phases stay small on purpose: if a phase grows past ~a week of work, split it.
- The constitution (`mission.md`, `tech-stack.md`, this file) is updated when a phase changes scope, audience, or stack — not after the fact.
