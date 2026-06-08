import { describe, expect, test } from "vitest";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const read = (rel: string) => readFileSync(join(root, rel), "utf-8");
const exists = (rel: string) => existsSync(join(root, rel));

describe("Phase 1 — Catalogs: file & config validation", () => {
  describe("Data model", () => {
    const schema = read("prisma/schema.prisma");

    test("schema declares Agent, Ailment, Therapy, TherapyAilment models", () => {
      for (const m of ["Agent", "Ailment", "Therapy", "TherapyAilment"]) {
        expect(schema).toMatch(new RegExp(`model\\s+${m}\\b`));
      }
    });

    test("Severity enum is declared with mild / moderate / severe", () => {
      expect(schema).toMatch(/enum\s+Severity\s*\{[\s\S]*mild[\s\S]*moderate[\s\S]*severe[\s\S]*\}/);
    });

    test("Ailment.severity is typed as Severity", () => {
      expect(schema).toMatch(/severity\s+Severity\b/);
    });

    test("Agent has a nullable archivedAt timestamp (soft archive)", () => {
      expect(schema).toMatch(/archivedAt\s+DateTime\?/);
    });

    test("Ailment.name and Therapy.name are unique", () => {
      const ailmentBlock = schema.match(/model\s+Ailment\s*\{[\s\S]*?\n\}/)?.[0] ?? "";
      const therapyBlock = schema.match(/model\s+Therapy\s*\{[\s\S]*?\n\}/)?.[0] ?? "";
      expect(ailmentBlock).toMatch(/name\s+String\s+@unique/);
      expect(therapyBlock).toMatch(/name\s+String\s+@unique/);
    });

    test("TherapyAilment has composite PK and named relations", () => {
      const joinBlock = schema.match(/model\s+TherapyAilment\s*\{[\s\S]*?\n\}/)?.[0] ?? "";
      expect(joinBlock).toMatch(/@@id\(\[therapyId,\s*ailmentId\]\)/);
      expect(joinBlock).toMatch(/therapy\s+Therapy\s+@relation/);
      expect(joinBlock).toMatch(/ailment\s+Ailment\s+@relation/);
    });

    test("a *_catalogs migration folder exists", () => {
      const dir = join(root, "prisma/migrations");
      expect(existsSync(dir)).toBe(true);
      const entries = readdirSync(dir);
      expect(entries.some((e) => e.endsWith("_catalogs"))).toBe(true);
    });
  });

  describe("Seed", () => {
    test("prisma/seed.ts exists", () => {
      expect(exists("prisma/seed.ts")).toBe(true);
    });

    test("package.json wires prisma.seed and includes tsx", () => {
      const pkg = JSON.parse(read("package.json"));
      expect(pkg.prisma?.seed).toBe("tsx prisma/seed.ts");
      expect(pkg.devDependencies).toHaveProperty("tsx");
    });

    test("seed upserts ailments, therapies, and the join table", () => {
      const seed = read("prisma/seed.ts");
      expect(seed).toMatch(/ailment\.upsert/);
      expect(seed).toMatch(/therapy\.upsert/);
      expect(seed).toMatch(/therapyAilment\.upsert/);
    });
  });

  describe("UI primitives", () => {
    test("shadcn-style primitives exist", () => {
      for (const file of [
        "src/components/ui/button.tsx",
        "src/components/ui/input.tsx",
        "src/components/ui/label.tsx",
        "src/components/ui/table.tsx",
        "src/components/ui/badge.tsx",
        "src/components/ui/card.tsx",
      ]) {
        expect(exists(file)).toBe(true);
      }
    });

    test("src/lib/utils.ts exports a cn helper", () => {
      expect(exists("src/lib/utils.ts")).toBe(true);
      expect(read("src/lib/utils.ts")).toMatch(/export\s+function\s+cn\b/);
    });

    test("form / styling deps installed", () => {
      const pkg = JSON.parse(read("package.json"));
      const all = { ...pkg.dependencies, ...pkg.devDependencies };
      for (const dep of [
        "clsx",
        "tailwind-merge",
        "class-variance-authority",
        "zod",
        "react-hook-form",
        "@hookform/resolvers",
      ]) {
        expect(all).toHaveProperty(dep);
      }
    });
  });

  describe("Validation & server actions", () => {
    test("Zod schemas live at src/lib/validation/agent.ts", () => {
      expect(exists("src/lib/validation/agent.ts")).toBe(true);
      const v = read("src/lib/validation/agent.ts");
      expect(v).toMatch(/createAgentSchema/);
      expect(v).toMatch(/updateAgentSchema/);
      expect(v).toMatch(/archiveAgentSchema/);
    });

    test("server actions import the Zod schemas and start with use server", () => {
      const actions = read("src/app/agents/actions.ts");
      expect(actions).toMatch(/^"use server"/);
      expect(actions).toMatch(/from\s+"@\/lib\/validation\/agent"/);
      expect(actions).toMatch(/createAgent\b/);
      expect(actions).toMatch(/updateAgent\b/);
      expect(actions).toMatch(/setAgentArchived\b/);
    });
  });

  describe("Routes & nav", () => {
    test("Phase 1 routes are present", () => {
      for (const route of [
        "src/app/agents/page.tsx",
        "src/app/agents/new/page.tsx",
        "src/app/agents/[id]/edit/page.tsx",
        "src/app/ailments/page.tsx",
        "src/app/therapies/page.tsx",
      ]) {
        expect(exists(route)).toBe(true);
      }
    });

    test("Header includes nav links for the three catalogs", () => {
      const header = read("src/components/layout/Header.tsx");
      expect(header).toMatch(/\/agents\b/);
      expect(header).toMatch(/\/ailments\b/);
      expect(header).toMatch(/\/therapies\b/);
    });
  });

  describe("Out-of-scope guardrail (still deferred after Phase 1)", () => {
    // Appointment + dashboard guards moved to the MVP test file when those
    // landed. The catalog-CRUD and Playwright guards remain — those are
    // still deferred.
    test("no in-app CRUD pages for ailments or therapies", () => {
      for (const route of [
        "src/app/ailments/new",
        "src/app/ailments/[id]/edit",
        "src/app/therapies/new",
        "src/app/therapies/[id]/edit",
      ]) {
        expect(exists(route)).toBe(false);
      }
    });

    test("Playwright is not installed", () => {
      const pkg = JSON.parse(read("package.json"));
      const all = { ...pkg.dependencies, ...pkg.devDependencies };
      for (const dep of ["playwright", "@playwright/test"]) {
        expect(all).not.toHaveProperty(dep);
      }
    });
  });
});
