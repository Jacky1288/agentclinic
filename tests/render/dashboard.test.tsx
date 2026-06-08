import { afterEach, describe, expect, test, vi } from "vitest";
import { renderToString } from "react-dom/server";

vi.mock("@/lib/queries/appointments", () => ({
  listTodaysAppointments: vi.fn(),
  listUpcomingByDay: vi.fn(),
}));

vi.mock("@/app/dashboard/actions", () => ({
  cancelAppointment: vi.fn(),
}));

const { listTodaysAppointments, listUpcomingByDay } = await import(
  "@/lib/queries/appointments"
);
const DashboardPage = (await import("../../src/app/dashboard/page")).default;

afterEach(() => {
  vi.mocked(listTodaysAppointments).mockReset();
  vi.mocked(listUpcomingByDay).mockReset();
});

function makeAppt(time: Date) {
  return {
    id: `a-${time.getHours()}`,
    agentId: "agent-1",
    therapyId: "therapy-1",
    slotId: "slot-1",
    status: "booked" as const,
    createdAt: new Date(),
    updatedAt: new Date(),
    agent: {
      id: "agent-1",
      name: "Claudia",
      modelFamily: "Claude",
      intakeDate: new Date(),
      archivedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    therapy: {
      id: "therapy-1",
      name: "Mindful temperature reduction",
      description: "",
      durationMinutes: 30,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    slot: {
      id: "slot-1",
      agentId: "agent-1",
      startsAt: time,
      createdAt: new Date(),
    },
  };
}

function buildUpcoming(): { date: Date; count: number }[] {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    return { date: d, count: i === 0 ? 2 : i === 1 ? 1 : 0 };
  });
}

describe("/dashboard renders today + week + quick links", () => {
  test("today's table shows agent and therapy names", async () => {
    const at10 = new Date();
    at10.setHours(10, 0, 0, 0);
    vi.mocked(listTodaysAppointments).mockResolvedValue([
      makeAppt(at10),
    ] as never);
    vi.mocked(listUpcomingByDay).mockResolvedValue(buildUpcoming());

    const html = renderToString(await DashboardPage());
    expect(html).toContain("Claudia");
    expect(html).toContain("Mindful temperature reduction");
    expect(html).toContain("10:00");
  });

  test("renders empty-state copy when no appointments today", async () => {
    vi.mocked(listTodaysAppointments).mockResolvedValue([]);
    vi.mocked(listUpcomingByDay).mockResolvedValue(buildUpcoming());

    const html = renderToString(await DashboardPage());
    expect(html).toMatch(/No appointments today/);
  });

  test("renders 7 day bars and quick links to the catalog routes", async () => {
    vi.mocked(listTodaysAppointments).mockResolvedValue([]);
    vi.mocked(listUpcomingByDay).mockResolvedValue(buildUpcoming());

    const html = renderToString(await DashboardPage());
    const bars = html.match(/aria-hidden="true"/g) ?? [];
    expect(bars.length).toBeGreaterThanOrEqual(7);
    for (const href of ["/agents", "/ailments", "/therapies", "/book"]) {
      expect(html).toContain(`href="${href}"`);
    }
  });
});
