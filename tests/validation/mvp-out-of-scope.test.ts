import { describe, expect, test } from "vitest";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const read = (rel: string) => readFileSync(join(root, rel), "utf-8");
const exists = (rel: string) => existsSync(join(root, rel));

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

describe("MVP — Out-of-scope guardrail", () => {
  test("no per-agent dashboard route (Phase 4)", () => {
    expect(exists("src/app/dashboard/agents")).toBe(false);
  });

  test("Playwright is not installed (Phase 5)", () => {
    const pkg = JSON.parse(read("package.json"));
    const all = { ...pkg.dependencies, ...pkg.devDependencies };
    for (const dep of ["playwright", "@playwright/test"]) {
      expect(all).not.toHaveProperty(dep);
    }
    expect(exists("playwright.config.ts")).toBe(false);
    expect(exists("playwright.config.js")).toBe(false);
  });

  test("no auth library is installed or imported", () => {
    const pkg = JSON.parse(read("package.json"));
    const all = { ...pkg.dependencies, ...pkg.devDependencies };
    const banned = ["next-auth", "lucia-auth", "@clerk/nextjs", "iron-session"];
    for (const dep of banned) {
      expect(all).not.toHaveProperty(dep);
    }
    const files = walk(join(root, "src")).filter((f) =>
      /\.(tsx?|jsx?)$/.test(f),
    );
    for (const file of files) {
      const text = readFileSync(file, "utf-8");
      for (const dep of banned) {
        expect(text).not.toContain(`"${dep}"`);
        expect(text).not.toContain(`'${dep}'`);
      }
    }
  });

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

  test("no staff-initiated booking nested under /dashboard", () => {
    expect(exists("src/app/dashboard/book")).toBe(false);
  });
});
