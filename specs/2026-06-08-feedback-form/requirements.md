# Phase 2 — Feedback form: Requirements

## Goal

Visitors can leave free-text feedback from a public page; staff see submissions in the dashboard. First half of the post-MVP roadmap, per [roadmap.md](../roadmap.md).

## Scope (in)

- **Public `/feedback` page** with a working submission form.
- **Server action** that validates and writes to a new `Feedback` table via Prisma.
- **Confirmation state** after a successful submission (success message on the same route, no redirect required).
- **`Feedback` data model** + migration + minimal seed entries so the dashboard panel looks populated in dev.
- **Dashboard panel** on `/dashboard` listing recent submissions in chronological order, newest first.
- **Validation tests** for the Zod schema; **render tests** for the form and the dashboard panel.

## Form fields

| Field    | Type   | Required | Notes                                                       |
| -------- | ------ | -------- | ----------------------------------------------------------- |
| subject  | string | yes      | Short single-line, 3–120 chars.                             |
| message  | string | yes      | Multi-line, 10–2000 chars.                                  |
| contact  | string | no       | Freeform — email, handle, or anything. 0–200 chars, trimmed. |

All validation lives in a Zod schema that's shared between the server action and the client form via `@hookform/resolvers`.

## Data model

New Prisma model:

```prisma
model Feedback {
  id        String   @id @default(cuid())
  subject   String
  message   String
  contact   String?
  createdAt DateTime @default(now())

  @@index([createdAt])
}
```

- No `status` field this phase — kept append-only on purpose (see non-goals).
- No foreign keys; feedback is not linked to agents or therapies in this phase.

## Decisions

- **Voice/copy:** neutral and clear, not in-character. The booking flow carries the parody; the feedback form should feel like a real intake form so submissions are usable.
- **Anti-spam:** none this phase. The site has no public traffic yet; revisit if Phase 3 or beyond brings real visitors. Documented here so we don't forget.
- **Delivery:** DB-only. No email, no webhook. Staff read submissions from the dashboard.
- **Dashboard panel placement:** below the existing "Today" + "This week" + "Quick links" grid on `/dashboard`, as a full-width card.
- **List length:** dashboard shows the **20 most recent** submissions. No pagination this phase.
- **Empty state:** dashboard panel renders an in-character empty message ("No feedback yet. The agents are too polite.") when the table is empty — matches the existing "Today" card empty state.

## Context

- Per [mission.md](../mission.md), the primary audience is humans on modern browsers; the feedback form is for humans, not agents.
- Per [tech-stack.md](../tech-stack.md), no new top-level dependencies. Use existing stack (Next.js server actions, Prisma, Zod, react-hook-form, Tailwind).
- Per the existing dashboard ([src/app/dashboard/page.tsx](../../src/app/dashboard/page.tsx)), the panel should match the existing `Card` / `Table` component conventions and dark-mode classes.
- Per the existing booking flow ([src/app/book/actions.ts](../../src/app/book/actions.ts)), the server action should follow the same shape (Zod validation, Prisma write, revalidate path).

## Non-goals (explicit)

- **No auth on the dashboard panel.** Dashboard stays gated by obscurity, consistent with the rest of the dashboard.
- **No edit or delete from the dashboard.** Feedback is append-only. Staff can read; that's it.
- **No reply UI or two-way conversation.** Submitter sends a message; that's the entire interaction surface.
- **No email/notification delivery** (already deferred in tech-stack.md).
- **No tagging to agents or therapies.** Feedback is freeform and unlinked.
- **No status workflow** (no new/read/archived). Append-only.
- **No pagination, search, or filtering** on the dashboard list. 20-most-recent is the whole view.
- **No public listing of feedback.** Submissions are visible to staff only.
