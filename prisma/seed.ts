import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../src/generated/prisma/client";

const databaseUrl = process.env["DATABASE_URL"] ?? "file:./dev.db";
const adapter = new PrismaBetterSqlite3({ url: databaseUrl });
const db = new PrismaClient({ adapter });

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
