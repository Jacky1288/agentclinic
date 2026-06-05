import { afterEach, describe, expect, test, vi } from "vitest";
import { renderToString } from "react-dom/server";

vi.mock("@/lib/queries/agents", () => ({
  listAgents: vi.fn(),
}));

vi.mock("@/app/agents/actions", () => ({
  setAgentArchived: vi.fn(),
}));

const { listAgents } = await import("@/lib/queries/agents");
const AgentsPage = (await import("../../src/app/agents/page")).default;

afterEach(() => {
  vi.mocked(listAgents).mockReset();
});

const seeded = [
  {
    id: "a-1",
    name: "Claudia",
    modelFamily: "Claude",
    intakeDate: new Date("2026-05-12"),
    archivedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

describe("/agents renders the staff list", () => {
  test("shows seeded names, New agent link, and Show archived toggle", async () => {
    vi.mocked(listAgents).mockResolvedValue(seeded as never);
    const html = renderToString(
      await AgentsPage({ searchParams: Promise.resolve({}) }),
    );
    expect(html).toContain("Claudia");
    expect(html).toContain("Claude");
    expect(html).toMatch(/href="\/agents\/new"/);
    expect(html).toMatch(/Show archived/);
    expect(html).toMatch(/href="\/agents\/a-1\/edit"/);
  });

  test("shows Show active + Unarchive when viewing archived", async () => {
    const archivedAt = new Date("2026-01-15");
    vi.mocked(listAgents).mockResolvedValue([
      { ...seeded[0]!, archivedAt },
    ] as never);
    const html = renderToString(
      await AgentsPage({ searchParams: Promise.resolve({ archived: "1" }) }),
    );
    expect(html).toMatch(/Show active/);
    expect(html).toMatch(/Unarchive/);
  });

  test("empty state when no agents", async () => {
    vi.mocked(listAgents).mockResolvedValue([]);
    const html = renderToString(
      await AgentsPage({ searchParams: Promise.resolve({}) }),
    );
    expect(html).toMatch(/No agents on the roster yet/);
  });
});
