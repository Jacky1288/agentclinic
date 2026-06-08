import { describe, expect, test } from "vitest";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const read = (rel: string) => readFileSync(join(root, rel), "utf-8");
const exists = (rel: string) => existsSync(join(root, rel));

describe("Phase 2 — Feedback form: file & config validation", () => {
  describe("Data model", () => {
    const schema = read("prisma/schema.prisma");

    test("schema declares a Feedback model", () => {
      expect(schema).toMatch(/model\s+Feedback\s*\{/);
    });

    test("Feedback has the spec'd fields and nothing more", () => {
      const block = schema.match(/model\s+Feedback\s*\{[\s\S]*?\n\}/)?.[0] ?? "";
      expect(block).toMatch(/\bid\s+String\s+@id\b/);
      expect(block).toMatch(/\bsubject\s+String\b/);
      expect(block).toMatch(/\bmessage\s+String\b/);
      expect(block).toMatch(/\bcontact\s+String\?\s*$/m);
      expect(block).toMatch(/\bcreatedAt\s+DateTime\s+@default\(now\(\)\)/);
      expect(block).toMatch(/@@index\(\[createdAt\]\)/);

      // Negative: no status, no updatedAt, no FKs in this phase.
      expect(block).not.toMatch(/\bstatus\b/);
      expect(block).not.toMatch(/\bupdatedAt\b/);
      expect(block).not.toMatch(/@relation/);
    });

    test("a *_phase2_feedback migration folder exists", () => {
      const dir = join(root, "prisma/migrations");
      expect(existsSync(dir)).toBe(true);
      const entries = readdirSync(dir);
      expect(entries.some((e) => e.endsWith("_phase2_feedback"))).toBe(true);
    });
  });

  describe("Validation & queries", () => {
    test("Zod schema at src/lib/validation/feedback.ts", () => {
      expect(exists("src/lib/validation/feedback.ts")).toBe(true);
      const v = read("src/lib/validation/feedback.ts");
      expect(v).toMatch(/feedbackSchema/);
      expect(v).toMatch(/FeedbackInput/);
    });

    test("feedback query helpers exist", () => {
      expect(exists("src/lib/queries/feedback.ts")).toBe(true);
      const q = read("src/lib/queries/feedback.ts");
      expect(q).toMatch(/export\s+async\s+function\s+createFeedback\b/);
      expect(q).toMatch(/export\s+async\s+function\s+listRecentFeedback\b/);
      expect(q).toMatch(/export\s+type\s+FeedbackRow\b/);
    });
  });

  describe("Routes & server action", () => {
    test("/feedback page exists and renders the form", () => {
      expect(exists("src/app/feedback/page.tsx")).toBe(true);
      const page = read("src/app/feedback/page.tsx");
      expect(page).toMatch(/FeedbackForm/);
    });

    test("submitFeedback action validates via Zod and revalidates dashboard", () => {
      const actions = read("src/app/feedback/actions.ts");
      expect(actions).toMatch(/^"use server"/);
      expect(actions).toMatch(/from\s+"@\/lib\/validation\/feedback"/);
      expect(actions).toMatch(/submitFeedback\b/);
      expect(actions).toMatch(/revalidatePath\(["']\/dashboard["']\)/);
    });

    test("Header includes a nav link for /feedback", () => {
      const header = read("src/components/layout/Header.tsx");
      expect(header).toMatch(/\/feedback\b/);
    });
  });

  describe("Dashboard panel", () => {
    test("dashboard imports listRecentFeedback and renders a 'Recent feedback' card", () => {
      const page = read("src/app/dashboard/page.tsx");
      expect(page).toMatch(/listRecentFeedback/);
      expect(page).toMatch(/Recent feedback/);
    });
  });

  describe("Seed", () => {
    test("seed imports and seeds feedback", () => {
      const seed = read("prisma/seed.ts");
      expect(seed).toMatch(/feedback\.create/);
      expect(seed).toMatch(/feedback\.count/);
    });
  });

  describe("Scope guardrails", () => {
    test("no new top-level dependencies vs MVP-era stack", () => {
      const pkg = JSON.parse(read("package.json"));
      const all = { ...pkg.dependencies, ...pkg.devDependencies };
      // Email / notification libs should NOT appear.
      for (const banned of [
        "resend",
        "nodemailer",
        "@sendgrid/mail",
        "postmark",
      ]) {
        expect(all).not.toHaveProperty(banned);
      }
      // Captcha / rate-limit libs should NOT appear.
      for (const banned of [
        "@upstash/ratelimit",
        "express-rate-limit",
        "@hcaptcha/react-hcaptcha",
        "react-google-recaptcha",
      ]) {
        expect(all).not.toHaveProperty(banned);
      }
      // Auth libs (already covered by MVP guardrail, repeated here for the phase).
      for (const banned of [
        "next-auth",
        "lucia-auth",
        "@clerk/nextjs",
        "iron-session",
      ]) {
        expect(all).not.toHaveProperty(banned);
      }
    });

    test("no edit or delete routes under /feedback or /dashboard for feedback", () => {
      expect(exists("src/app/feedback/[id]")).toBe(false);
      expect(exists("src/app/dashboard/feedback")).toBe(false);
    });

    test("no public listing route for feedback", () => {
      // /feedback should be the submit form only; no /feedback/all etc.
      const dir = join(root, "src/app/feedback");
      const entries = readdirSync(dir);
      const subroutes = entries.filter((e) =>
        existsSync(join(dir, e, "page.tsx")),
      );
      expect(subroutes).toEqual([]);
    });
  });
});
