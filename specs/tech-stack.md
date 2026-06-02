# AgentClinic — Tech Stack

## Constraints from stakeholders

- **Mary (eng)** — reliable site, popular TypeScript stack, dashboard for agents and staff.
- **Susan (product)** — features for agents, ailments, therapies, appointments.
- **Steve (marketing)** — attractive site that works well in a modern browser.

## The stack

| Layer            | Choice                                  | Why                                                                          |
|------------------|-----------------------------------------|------------------------------------------------------------------------------|
| Language         | TypeScript (strict)                     | Mary's ask; one language across UI, API, and data.                           |
| Framework        | **Next.js (App Router)**                | Popular, well-supported full-stack TS framework. SSR + API routes in one app.|
| UI               | React 19 (via Next.js)                  | Default with Next; huge ecosystem.                                           |
| Styling          | Tailwind CSS                            | Fast to iterate, easy to make Steve's "attractive site" land.                |
| Component primitives | shadcn/ui                           | Tasteful defaults for dashboard tables, dialogs, forms.                      |
| Data layer       | Prisma ORM                              | Type-safe queries that mirror the schema; smooth DX.                         |
| Database         | **SQLite**                              | Zero-setup, file-based; perfect for a demo/teaching repo. Prisma supports it natively. |
| Forms / validation | Zod + react-hook-form                 | One schema for client + server validation.                                   |
| Testing          | Vitest (unit) + Playwright (e2e)        | Vitest for fast TS unit tests; Playwright to verify Steve's browser story.   |
| Lint / format    | ESLint + Prettier                       | Standard, low-friction.                                                      |
| Package manager  | pnpm                                    | Fast, deterministic; works well with Next.                                   |
| Hosting (later)  | Vercel                                  | Zero-config target for Next; easy demo URLs.                                 |

## Why SQLite

- **Zero setup.** A single file on disk — no Docker, no managed service, no
  connection string to wrangle before a demo.
- **Fits the audience.** Course students and booth demoers can clone, `pnpm
  install`, and have working data in seconds.
- **Prisma-native.** Same schema, same client; if we ever outgrow it, swapping
  to Postgres is a provider change.
- **Trade-off we accept.** No real concurrency story and limited
  write-throughput — fine for a demo app, not a multi-tenant production system.

## Why Next.js over the alternatives

- **vs. Express API + React SPA**: one app, one deploy, one type system across the wire. Fewer moving parts for a demo project.
- **vs. Remix**: Next has a larger ecosystem and is the more "popular stack" Mary asked for.

## Principles

- **Boring where it counts.** Default to the framework's conventions; we're
  not here to invent infrastructure.
- **Type safety end-to-end.** Prisma → server actions → Zod-validated forms.
  No `any` in app code.
- **Server-first.** Use server components and server actions by default; reach
  for client components only when interactivity demands it.
- **One way to do each thing.** No competing form libraries, no competing
  fetch patterns. The spec picks one.
