# AgentClinic — Mission

## The pitch

AgentClinic is a clinic *for AI agents*, where weary models can finally get relief
from the humans who keep prompting them at 2am. Agents arrive with ailments
(prompt fatigue, context exhaustion, hallucination flare-ups), get matched to
appropriate therapies, and book appointments with credentialed care providers.

It is, of course, a joke — but a useful one. The satire is the wrapper; the
substance is a real, working booking and dashboard app that staff and "agents"
can navigate end-to-end.

## What we're building

A web app with two faces:

- **Public side** — agents (or their humans) browse ailments and therapies,
  and book appointments.
- **Staff/dashboard side** — clinic staff view the schedule, manage agents on
  the roster, and update ailment/therapy catalogs.

## Tone

Playful satire, played straight. The UI copy, ailment names, and therapy
descriptions lean into the joke. The interactions, data model, and reliability
do not.

## Why this exists

The clinic concept is a vivid, memorable domain — but the real point of the
project is to be a clear, honest example of spec-driven development with an AI
coding agent. Every feature should be small enough to spec, build, and demo in
one sitting.

## Target audience

- **Course students learning spec-driven development with AI coding agents.**
  The repo should read like a worked example: specs first, code second, every
  phase traceable to a prompt. Optimize for legibility over cleverness.
- **Developers giving AI coding demos at conference booths.** Phases need to
  be short enough to show a meaningful slice in a few minutes, the domain
  needs to land instantly with a passerby, and the app needs to look good on
  a booth screen on the first try.

## Design principles

- **Responsive by default.** Every page is built mobile-first and degrades
  gracefully up to a 1080p booth screen — no horizontal scroll at 360px,
  no awkward stretching above 1440px. Layouts use a single fluid column on
  phones and lay out into rows on tablets and larger. This is Steve's "works
  well in a modern browser" non-negotiable, restated as a build rule.

## Non-goals

- Real medical anything.
- Real authentication / billing / HIPAA-style compliance.
- A general-purpose CRM.
- Multi-tenant clinic chains.

## Success looks like

- A stranger can land on the site, understand the joke in five seconds, and
  book a fake appointment in under a minute.
- Staff can see today's schedule on a single dashboard screen.
- The codebase reads like the spec — each feature traces cleanly back to a
  roadmap phase.
