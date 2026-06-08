import { afterEach, describe, expect, test, vi } from "vitest";
import { renderToString } from "react-dom/server";

vi.mock("@/lib/queries/agents", () => ({
  getAgent: vi.fn(),
}));
vi.mock("@/lib/queries/therapies", () => ({
  getTherapy: vi.fn(),
}));
vi.mock("@/lib/queries/slots", async () => {
  const actual = await vi.importActual<typeof import("@/lib/queries/slots")>(
    "@/lib/queries/slots",
  );
  return {
    ...actual,
    listAvailableSlots: vi.fn(),
  };
});
vi.mock("@/app/book/actions", () => ({
  bookAppointment: vi.fn(),
}));

const { getAgent } = await import("@/lib/queries/agents");
const { getTherapy } = await import("@/lib/queries/therapies");
const { listAvailableSlots } = await import("@/lib/queries/slots");
const Step3Page = (
  await import("../../src/app/book/[agentId]/[therapyId]/page")
).default;

afterEach(() => {
  vi.mocked(getAgent).mockReset();
  vi.mocked(getTherapy).mockReset();
  vi.mocked(listAvailableSlots).mockReset();
});

const agent = {
  id: "a-1",
  name: "Claudia",
  modelFamily: "Claude",
  intakeDate: new Date(),
  archivedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};
const therapy = {
  id: "t-1",
  name: "Mindful temperature reduction",
  description: "",
  durationMinutes: 30,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("/book/[agentId]/[therapyId] step 3", () => {
  test("renders day-grouped slot buttons labelled HH:mm", async () => {
    vi.mocked(getAgent).mockResolvedValue(agent as never);
    vi.mocked(getTherapy).mockResolvedValue(therapy as never);
    const today = new Date();
    today.setHours(9, 30, 0, 0);
    const later = new Date(today);
    later.setHours(10, 0, 0, 0);
    vi.mocked(listAvailableSlots).mockResolvedValue([
      { id: "s-1", agentId: "a-1", startsAt: today, createdAt: new Date() },
      { id: "s-2", agentId: "a-1", startsAt: later, createdAt: new Date() },
    ] as never);

    const html = renderToString(
      await Step3Page({
        params: Promise.resolve({ agentId: "a-1", therapyId: "t-1" }),
      }),
    );
    expect(html).toContain("Claudia");
    expect(html).toContain("Mindful temperature reduction");
    expect(html).toContain("Today");
    expect(html).toMatch(/>09:30</);
    expect(html).toMatch(/>10:00</);
    expect(html).toMatch(/name="slotId"\s+value="s-1"/);
  });

  test("renders the empty-state copy when no slots are available", async () => {
    vi.mocked(getAgent).mockResolvedValue(agent as never);
    vi.mocked(getTherapy).mockResolvedValue(therapy as never);
    vi.mocked(listAvailableSlots).mockResolvedValue([]);

    const html = renderToString(
      await Step3Page({
        params: Promise.resolve({ agentId: "a-1", therapyId: "t-1" }),
      }),
    );
    expect(html).toMatch(/No openings/);
  });
});
