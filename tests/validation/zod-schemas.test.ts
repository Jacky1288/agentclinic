import { describe, expect, test } from "vitest";
import {
  archiveAgentSchema,
  createAgentSchema,
  updateAgentSchema,
} from "../../src/lib/validation/agent";

describe("agent Zod schemas", () => {
  test("createAgentSchema accepts a well-formed input", () => {
    const r = createAgentSchema.safeParse({
      name: "Claudia",
      modelFamily: "Claude",
      intakeDate: "2026-06-05",
    });
    expect(r.success).toBe(true);
  });

  test("createAgentSchema rejects an empty name", () => {
    const r = createAgentSchema.safeParse({
      name: "",
      modelFamily: "Claude",
      intakeDate: "2026-06-05",
    });
    expect(r.success).toBe(false);
  });

  test("createAgentSchema rejects an unparseable date", () => {
    const r = createAgentSchema.safeParse({
      name: "Claudia",
      modelFamily: "Claude",
      intakeDate: "not a date",
    });
    expect(r.success).toBe(false);
  });

  test("updateAgentSchema requires an id", () => {
    const r = updateAgentSchema.safeParse({
      name: "Claudia",
      modelFamily: "Claude",
      intakeDate: "2026-06-05",
    });
    expect(r.success).toBe(false);
  });

  test("archiveAgentSchema requires id + boolean archive", () => {
    expect(archiveAgentSchema.safeParse({ id: "x", archive: true }).success).toBe(true);
    expect(archiveAgentSchema.safeParse({ id: "", archive: true }).success).toBe(false);
    expect(
      archiveAgentSchema.safeParse({ id: "x", archive: "true" }).success,
    ).toBe(false);
  });
});
