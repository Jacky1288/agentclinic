import { afterEach, describe, expect, test, vi } from "vitest";
import { renderToString } from "react-dom/server";

vi.mock("@/lib/queries/appointments", () => ({
  listTodaysAppointments: vi.fn(),
  listUpcomingByDay: vi.fn(),
}));
vi.mock("@/lib/queries/feedback", () => ({
  listRecentFeedback: vi.fn(),
}));
vi.mock("@/app/dashboard/actions", () => ({
  cancelAppointment: vi.fn(),
}));

const { listTodaysAppointments, listUpcomingByDay } = await import(
  "@/lib/queries/appointments"
);
const { listRecentFeedback } = await import("@/lib/queries/feedback");
const DashboardPage = (await import("../../src/app/dashboard/page")).default;

afterEach(() => {
  vi.mocked(listTodaysAppointments).mockReset();
  vi.mocked(listUpcomingByDay).mockReset();
  vi.mocked(listRecentFeedback).mockReset();
});

function buildUpcoming(): { date: Date; count: number }[] {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    return { date: d, count: 0 };
  });
}

describe("/dashboard — recent feedback panel", () => {
  test("renders submissions with subject, truncated message, and contact", async () => {
    vi.mocked(listTodaysAppointments).mockResolvedValue([]);
    vi.mocked(listUpcomingByDay).mockResolvedValue(buildUpcoming());
    const justNow = new Date();
    vi.mocked(listRecentFeedback).mockResolvedValue([
      {
        id: "f-1",
        subject: "Booking flow worked",
        message: "Quick and clear, three taps to a confirmed slot.",
        contact: "ops@example.com",
        createdAt: justNow,
      },
      {
        id: "f-2",
        subject: "Could you offer evening slots",
        message: "Our agents wind down after 6pm.",
        contact: null,
        createdAt: justNow,
      },
    ]);

    const html = renderToString(await DashboardPage());
    expect(html).toContain("Recent feedback");
    expect(html).toContain("Booking flow worked");
    expect(html).toContain("Could you offer evening slots");
    expect(html).toContain("ops@example.com");
    expect(html).toMatch(/—/); // dash for missing contact in table layout
  });

  test("renders empty-state copy when no feedback exists", async () => {
    vi.mocked(listTodaysAppointments).mockResolvedValue([]);
    vi.mocked(listUpcomingByDay).mockResolvedValue(buildUpcoming());
    vi.mocked(listRecentFeedback).mockResolvedValue([]);

    const html = renderToString(await DashboardPage());
    expect(html).toContain("Recent feedback");
    expect(html).toMatch(/No feedback yet/);
  });

  test("quick links include the feedback route", async () => {
    vi.mocked(listTodaysAppointments).mockResolvedValue([]);
    vi.mocked(listUpcomingByDay).mockResolvedValue(buildUpcoming());
    vi.mocked(listRecentFeedback).mockResolvedValue([]);

    const html = renderToString(await DashboardPage());
    expect(html).toContain('href="/feedback"');
  });
});
