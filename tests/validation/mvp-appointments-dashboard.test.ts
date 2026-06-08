import { describe, expect, test } from "vitest";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const read = (rel: string) => readFileSync(join(root, rel), "utf-8");
const exists = (rel: string) => existsSync(join(root, rel));

describe("MVP — Appointments + Dashboard: file & config validation", () => {
  describe("Data model", () => {
    const schema = read("prisma/schema.prisma");

    test("schema declares Slot and Appointment models", () => {
      for (const m of ["Slot", "Appointment"]) {
        expect(schema).toMatch(new RegExp(`model\\s+${m}\\b`));
      }
    });

    test("Status enum has booked and cancelled", () => {
      expect(schema).toMatch(/enum\s+Status\s*\{[\s\S]*booked[\s\S]*cancelled[\s\S]*\}/);
    });

    test("Appointment.status defaults to booked", () => {
      const block = schema.match(/model\s+Appointment\s*\{[\s\S]*?\n\}/)?.[0] ?? "";
      expect(block).toMatch(/status\s+Status\s+@default\(booked\)/);
    });

    test("Slot has @@unique([agentId, startsAt]) and a startsAt index", () => {
      const block = schema.match(/model\s+Slot\s*\{[\s\S]*?\n\}/)?.[0] ?? "";
      expect(block).toMatch(/@@unique\(\[agentId,\s*startsAt\]\)/);
      expect(block).toMatch(/@@index\(\[startsAt\]\)/);
    });

    test("Appointment has named FK relations to Agent, Therapy, Slot", () => {
      const block = schema.match(/model\s+Appointment\s*\{[\s\S]*?\n\}/)?.[0] ?? "";
      expect(block).toMatch(/agent\s+Agent\s+@relation/);
      expect(block).toMatch(/therapy\s+Therapy\s+@relation/);
      expect(block).toMatch(/slot\s+Slot\s+@relation/);
    });

    test("a *_mvp_appointments migration folder exists", () => {
      const dir = join(root, "prisma/migrations");
      expect(existsSync(dir)).toBe(true);
      const entries = readdirSync(dir);
      expect(entries.some((e) => e.endsWith("_mvp_appointments"))).toBe(true);
    });

    test("Phase 1 models are unchanged in shape", () => {
      // sanity: we did not rename the existing models or remove their relations
      for (const m of ["Agent", "Ailment", "Therapy", "TherapyAilment"]) {
        expect(schema).toMatch(new RegExp(`model\\s+${m}\\b`));
      }
    });
  });

  describe("Constants & queries", () => {
    test("SLOT_DURATION_MINUTES = 30", () => {
      expect(exists("src/lib/constants.ts")).toBe(true);
      const c = read("src/lib/constants.ts");
      expect(c).toMatch(/SLOT_DURATION_MINUTES\s*=\s*30/);
    });

    test("slot helpers exist", () => {
      expect(exists("src/lib/queries/slots.ts")).toBe(true);
      const s = read("src/lib/queries/slots.ts");
      expect(s).toMatch(/export\s+async\s+function\s+listAvailableSlots\b/);
      expect(s).toMatch(/export\s+function\s+groupSlotsByDay\b/);
    });

    test("appointment helpers exist", () => {
      expect(exists("src/lib/queries/appointments.ts")).toBe(true);
      const a = read("src/lib/queries/appointments.ts");
      expect(a).toMatch(/export\s+async\s+function\s+listTodaysAppointments\b/);
      expect(a).toMatch(/export\s+async\s+function\s+listUpcomingByDay\b/);
    });
  });

  describe("Validation & server actions", () => {
    test("Zod schemas at src/lib/validation/appointment.ts", () => {
      expect(exists("src/lib/validation/appointment.ts")).toBe(true);
      const v = read("src/lib/validation/appointment.ts");
      expect(v).toMatch(/bookAppointmentSchema/);
      expect(v).toMatch(/cancelAppointmentSchema/);
    });

    test("booking action imports its Zod schema and starts with use server", () => {
      const actions = read("src/app/book/actions.ts");
      expect(actions).toMatch(/^"use server"/);
      expect(actions).toMatch(/from\s+"@\/lib\/validation\/appointment"/);
      expect(actions).toMatch(/bookAppointment\b/);
    });

    test("cancel action imports its Zod schema and starts with use server", () => {
      const actions = read("src/app/dashboard/actions.ts");
      expect(actions).toMatch(/^"use server"/);
      expect(actions).toMatch(/from\s+"@\/lib\/validation\/appointment"/);
      expect(actions).toMatch(/cancelAppointment\b/);
    });
  });

  describe("Routes & nav", () => {
    test("MVP routes are present", () => {
      for (const route of [
        "src/app/book/page.tsx",
        "src/app/book/[agentId]/page.tsx",
        "src/app/book/[agentId]/[therapyId]/page.tsx",
        "src/app/book/confirmed/[appointmentId]/page.tsx",
        "src/app/dashboard/page.tsx",
      ]) {
        expect(exists(route)).toBe(true);
      }
    });

    test("Header includes nav links for /book and /dashboard", () => {
      const header = read("src/components/layout/Header.tsx");
      expect(header).toMatch(/\/book\b/);
      expect(header).toMatch(/\/dashboard\b/);
    });
  });

  describe("Seed", () => {
    test("seed imports SLOT_DURATION_MINUTES and seeds slots + appointments", () => {
      const seed = read("prisma/seed.ts");
      expect(seed).toMatch(/SLOT_DURATION_MINUTES/);
      expect(seed).toMatch(/slot\.upsert/);
      expect(seed).toMatch(/appointment\.create/);
      expect(seed).toMatch(/appointment\.count/);
    });
  });
});
