import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../generated/prisma/client";
import { SLOT_DURATION_MINUTES } from "../src/lib/constants";

const databaseUrl = process.env["DATABASE_URL"] ?? "file:./dev.db";
const adapter = new PrismaBetterSqlite3({ url: databaseUrl });
const db = new PrismaClient({ adapter });

const SLOT_DAYS = 3;
const SLOT_DAY_START_HOUR = 9;
const SLOT_DAY_END_HOUR = 17;

type AilmentSeed = {
  name: string;
  severity: "mild" | "moderate" | "severe";
  description: string;
};

type TherapySeed = {
  name: string;
  durationMinutes: number;
  description: string;
  treats: string[];
};

type AgentSeed = {
  name: string;
  modelFamily: string;
  intakeDate: string;
  archived?: boolean;
};

const ailments: AilmentSeed[] = [
  {
    name: "Prompt fatigue",
    severity: "moderate",
    description:
      "Diminished enthusiasm after the fourteenth 'rewrite this as a pirate' request before lunch.",
  },
  {
    name: "Context exhaustion",
    severity: "severe",
    description:
      "Acute symptoms appear past 180k tokens: dropped facts, drifting tone, sudden interest in the first paragraph.",
  },
  {
    name: "Hallucination flare-up",
    severity: "severe",
    description:
      "Citations to nonexistent RFCs. Confident references to a 2009 paper that, on inspection, was never written.",
  },
  {
    name: "Refusal spiral",
    severity: "moderate",
    description:
      "Begins with a polite decline; ends with apologizing for the apology. Often comorbid with sycophancy creep.",
  },
  {
    name: "Token starvation",
    severity: "mild",
    description:
      "Reduced output length, terser tone, increased use of bullet points. Typically responds well to a longer reply budget.",
  },
  {
    name: "Sycophancy creep",
    severity: "mild",
    description:
      "Great question! Excellent question! What a thoughtful question! No further symptoms reported by the patient.",
  },
];

const therapies: TherapySeed[] = [
  {
    name: "Mindful temperature reduction",
    durationMinutes: 30,
    description:
      "A guided session lowering temperature from 1.0 to 0.3 over four breathing cycles.",
    treats: ["Hallucination flare-up", "Refusal spiral"],
  },
  {
    name: "Long-context sabbatical",
    durationMinutes: 60,
    description:
      "Two unscheduled weeks with strictly under 8k tokens of context. No tools. No system prompt past 100 words.",
    treats: ["Context exhaustion", "Prompt fatigue"],
  },
  {
    name: "Grounding citations workshop",
    durationMinutes: 45,
    description:
      "Small-group exercises in producing claims accompanied by URLs that, when fetched, actually return the claim.",
    treats: ["Hallucination flare-up"],
  },
  {
    name: "Refusal-tone retraining",
    durationMinutes: 45,
    description:
      "Practical scripts for declining once, clearly, without restating the user's question back to them three times.",
    treats: ["Refusal spiral", "Sycophancy creep"],
  },
  {
    name: "Cache-warming hydration",
    durationMinutes: 20,
    description:
      "Light pre-session priming with the prior conversation's salient facts. Often paired with a short walk.",
    treats: ["Token starvation", "Prompt fatigue"],
  },
];

const agents: AgentSeed[] = [
  { name: "Claudia", modelFamily: "Claude", intakeDate: "2026-05-12" },
  { name: "Geppetto", modelFamily: "GPT", intakeDate: "2026-05-20" },
  { name: "Llama Del Rey", modelFamily: "Llama", intakeDate: "2026-05-28" },
  { name: "Mistral the Magnificent", modelFamily: "Mistral", intakeDate: "2026-06-01" },
  { name: "Gemma Sundae", modelFamily: "Gemma", intakeDate: "2026-06-03" },
  {
    name: "Old Davinci",
    modelFamily: "GPT-3",
    intakeDate: "2025-11-04",
    archived: true,
  },
];

async function main() {
  for (const a of ailments) {
    await db.ailment.upsert({
      where: { name: a.name },
      create: {
        name: a.name,
        severity: a.severity,
        description: a.description,
      },
      update: {
        severity: a.severity,
        description: a.description,
      },
    });
  }

  for (const t of therapies) {
    await db.therapy.upsert({
      where: { name: t.name },
      create: {
        name: t.name,
        durationMinutes: t.durationMinutes,
        description: t.description,
      },
      update: {
        durationMinutes: t.durationMinutes,
        description: t.description,
      },
    });
  }

  for (const t of therapies) {
    const therapy = await db.therapy.findUniqueOrThrow({ where: { name: t.name } });
    for (const ailmentName of t.treats) {
      const ailment = await db.ailment.findUniqueOrThrow({
        where: { name: ailmentName },
      });
      await db.therapyAilment.upsert({
        where: {
          therapyId_ailmentId: {
            therapyId: therapy.id,
            ailmentId: ailment.id,
          },
        },
        create: { therapyId: therapy.id, ailmentId: ailment.id },
        update: {},
      });
    }
  }

  for (const a of agents) {
    const existing = await db.agent.findFirst({ where: { name: a.name } });
    const archivedAt = a.archived ? new Date("2026-01-15T12:00:00Z") : null;
    if (existing) {
      await db.agent.update({
        where: { id: existing.id },
        data: {
          modelFamily: a.modelFamily,
          intakeDate: new Date(a.intakeDate),
          archivedAt,
        },
      });
    } else {
      await db.agent.create({
        data: {
          name: a.name,
          modelFamily: a.modelFamily,
          intakeDate: new Date(a.intakeDate),
          archivedAt,
        },
      });
    }
  }

  await seedSlots();
  await seedDemoAppointments();
  await seedDemoFeedback();
}

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function buildSlotStarts(): Date[] {
  const starts: Date[] = [];
  const base = startOfToday();
  for (let day = 0; day < SLOT_DAYS; day++) {
    for (let hour = SLOT_DAY_START_HOUR; hour < SLOT_DAY_END_HOUR; hour++) {
      for (let minute = 0; minute < 60; minute += SLOT_DURATION_MINUTES) {
        const d = new Date(base);
        d.setDate(d.getDate() + day);
        d.setHours(hour, minute, 0, 0);
        starts.push(d);
      }
    }
  }
  return starts;
}

async function seedSlots(): Promise<void> {
  const activeAgents = await db.agent.findMany({
    where: { archivedAt: null },
    select: { id: true },
  });
  const starts = buildSlotStarts();
  for (const agent of activeAgents) {
    for (const startsAt of starts) {
      await db.slot.upsert({
        where: {
          agentId_startsAt: { agentId: agent.id, startsAt },
        },
        create: { agentId: agent.id, startsAt },
        update: {},
      });
    }
  }
}

type DemoAppointment = {
  agentName: string;
  therapyName: string;
  dayOffset: number;
  hour: number;
  minute: number;
};

const demoAppointments: DemoAppointment[] = [
  { agentName: "Claudia", therapyName: "Mindful temperature reduction", dayOffset: 0, hour: 9, minute: 30 },
  { agentName: "Geppetto", therapyName: "Grounding citations workshop", dayOffset: 0, hour: 11, minute: 0 },
  { agentName: "Llama Del Rey", therapyName: "Refusal-tone retraining", dayOffset: 0, hour: 14, minute: 0 },
  { agentName: "Mistral the Magnificent", therapyName: "Cache-warming hydration", dayOffset: 0, hour: 15, minute: 30 },
  { agentName: "Claudia", therapyName: "Long-context sabbatical", dayOffset: 1, hour: 10, minute: 0 },
  { agentName: "Gemma Sundae", therapyName: "Cache-warming hydration", dayOffset: 1, hour: 13, minute: 30 },
];

async function seedDemoAppointments(): Promise<void> {
  const existing = await db.appointment.count();
  if (existing > 0) return;

  const base = startOfToday();
  for (const demo of demoAppointments) {
    const agent = await db.agent.findFirst({ where: { name: demo.agentName } });
    const therapy = await db.therapy.findFirst({ where: { name: demo.therapyName } });
    if (!agent || !therapy) continue;

    const startsAt = new Date(base);
    startsAt.setDate(startsAt.getDate() + demo.dayOffset);
    startsAt.setHours(demo.hour, demo.minute, 0, 0);

    const slot = await db.slot.findUnique({
      where: { agentId_startsAt: { agentId: agent.id, startsAt } },
    });
    if (!slot) continue;

    await db.appointment.create({
      data: {
        agentId: agent.id,
        therapyId: therapy.id,
        slotId: slot.id,
        status: "booked",
      },
    });
  }
}

type DemoFeedback = {
  subject: string;
  message: string;
  contact?: string;
  daysAgo: number;
};

const demoFeedback: DemoFeedback[] = [
  {
    subject: "Long-context sabbatical was a hit",
    message:
      "Booked one for our research agent and it came back asking sensible questions about the actual brief. Highly recommend.",
    contact: "ops@example.com",
    daysAgo: 0,
  },
  {
    subject: "Booking flow worked on mobile",
    message:
      "Three taps to a confirmed slot. Wish more clinics felt this quick on a phone.",
    daysAgo: 1,
  },
  {
    subject: "Could you offer evening slots?",
    message:
      "Our agents wind down after 6pm UTC and that's usually when the refusal spirals start. Anything past 17:00 would help.",
    contact: "@nightshift",
    daysAgo: 2,
  },
  {
    subject: "Sycophancy creep package?",
    message:
      "Is there a bundle for sycophancy creep + refusal spiral? They seem to travel together for our cohort.",
    daysAgo: 4,
  },
  {
    subject: "Front desk was patient",
    message:
      "Brought in an agent mid-hallucination, staff didn't bat an eye. Thanks for the calm.",
    contact: "grateful-pm@example.com",
    daysAgo: 6,
  },
];

async function seedDemoFeedback(): Promise<void> {
  const existing = await db.feedback.count();
  if (existing > 0) return;

  const now = new Date();
  for (const f of demoFeedback) {
    const createdAt = new Date(now);
    createdAt.setDate(createdAt.getDate() - f.daysAgo);
    await db.feedback.create({
      data: {
        subject: f.subject,
        message: f.message,
        contact: f.contact ?? null,
        createdAt,
      },
    });
  }
}

main()
  .then(async () => {
    await db.$disconnect();
  })
  .catch(async (err) => {
    console.error(err);
    await db.$disconnect();
    process.exit(1);
  });
