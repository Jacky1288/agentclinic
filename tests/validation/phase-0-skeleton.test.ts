import { describe, expect, test } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const read = (rel: string) => readFileSync(join(root, rel), "utf-8");
const exists = (rel: string) => existsSync(join(root, rel));

describe("Phase 0 — Skeleton: file & config validation", () => {
  describe("Tooling", () => {
    test("package.json defines dev, build, start, lint, typecheck, test scripts", () => {
      const pkg = JSON.parse(read("package.json"));
      for (const script of [
        "dev",
        "build",
        "start",
        "lint",
        "typecheck",
        "test",
      ]) {
        expect(pkg.scripts).toHaveProperty(script);
      }
    });

    test("pnpm-lock.yaml is the lockfile of record; package-lock.json is gone", () => {
      expect(exists("pnpm-lock.yaml")).toBe(true);
      expect(exists("package-lock.json")).toBe(false);
    });

    test("Next.js, Tailwind, Prisma, Vitest are installed", () => {
      const pkg = JSON.parse(read("package.json"));
      const all = { ...pkg.dependencies, ...pkg.devDependencies };
      for (const dep of [
        "next",
        "react",
        "tailwindcss",
        "@prisma/client",
        "prisma",
        "vitest",
      ]) {
        expect(all).toHaveProperty(dep);
      }
    });
  });

  describe("TypeScript strictness", () => {
    test("tsconfig has strict + noUncheckedIndexedAccess on", () => {
      const cfg = JSON.parse(read("tsconfig.json"));
      expect(cfg.compilerOptions.strict).toBe(true);
      expect(cfg.compilerOptions.noUncheckedIndexedAccess).toBe(true);
    });
  });

  describe("Env hygiene", () => {
    test(".env is gitignored", () => {
      expect(read(".gitignore")).toMatch(/^\.env$/m);
    });

    test(".env.example is committed and carries DATABASE_URL", () => {
      expect(exists(".env.example")).toBe(true);
      expect(read(".env.example")).toContain('DATABASE_URL="file:./dev.db"');
    });

    test("prisma/dev.db is gitignored", () => {
      expect(read(".gitignore")).toMatch(/prisma\/dev\.db/);
    });
  });

  describe("Prisma", () => {
    test("schema.prisma has zero model blocks", () => {
      const schema = read("prisma/schema.prisma");
      expect(schema).not.toMatch(/^\s*model\s+/m);
    });

    test("schema.prisma declares the sqlite provider", () => {
      expect(read("prisma/schema.prisma")).toMatch(/provider\s*=\s*"sqlite"/);
    });

    test("src/lib/db.ts exports a singleton PrismaClient", () => {
      expect(exists("src/lib/db.ts")).toBe(true);
      const db = read("src/lib/db.ts");
      expect(db).toContain("PrismaClient");
      expect(db).toMatch(/globalForPrisma|globalThis/);
    });
  });

  describe("Landing page copy", () => {
    test("layout.tsx sets the AgentClinic title and joke description", () => {
      const layout = read("src/app/layout.tsx");
      expect(layout).toMatch(/title:\s*"AgentClinic"/);
      expect(layout).toMatch(/clinic for weary AI agents/i);
    });

    test("page.tsx renders the AgentClinic heading and the joke blurb", () => {
      const page = read("src/app/page.tsx");
      expect(page).toContain("AgentClinic");
      expect(page).toMatch(/prompt\s+fatigue/i);
      expect(page).toMatch(/context\s+exhaustion/i);
      expect(page).toMatch(/hallucination/i);
    });
  });

  describe("Main layout component", () => {
    test("Header, Main, Footer, MainLayout components are present", () => {
      for (const file of [
        "src/components/layout/Header.tsx",
        "src/components/layout/Main.tsx",
        "src/components/layout/Footer.tsx",
        "src/components/layout/MainLayout.tsx",
      ]) {
        expect(exists(file)).toBe(true);
      }
    });

    test("MainLayout.css exists and is imported from MainLayout.tsx", () => {
      expect(exists("src/components/layout/MainLayout.css")).toBe(true);
      expect(read("src/components/layout/MainLayout.tsx")).toContain(
        './MainLayout.css',
      );
    });

    test("Main subcomponent renders a <main> landmark", () => {
      expect(read("src/components/layout/Main.tsx")).toContain("<main");
    });

    test("app/layout.tsx wraps children in <MainLayout>", () => {
      const layout = read("src/app/layout.tsx");
      expect(layout).toMatch(/<MainLayout>\s*\{children\}\s*<\/MainLayout>/);
    });
  });

  describe("Out-of-scope guardrail", () => {
    test("no routes exist besides /", () => {
      for (const route of [
        "src/app/agents",
        "src/app/ailments",
        "src/app/therapies",
        "src/app/appointments",
        "src/app/dashboard",
      ]) {
        expect(exists(route)).toBe(false);
      }
    });

    test("forbidden deps not installed", () => {
      const pkg = JSON.parse(read("package.json"));
      const all = { ...pkg.dependencies, ...pkg.devDependencies };
      for (const dep of [
        "shadcn-ui",
        "@shadcn/ui",
        "react-hook-form",
        "zod",
        "playwright",
        "@playwright/test",
      ]) {
        expect(all).not.toHaveProperty(dep);
      }
    });
  });
});
