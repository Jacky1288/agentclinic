import { afterEach, describe, expect, test, vi } from "vitest";
import { renderToString } from "react-dom/server";

vi.mock("@/lib/queries/therapies", () => ({
  listTherapiesWithAilments: vi.fn(),
}));

const { listTherapiesWithAilments } = await import("@/lib/queries/therapies");
const TherapiesPage = (await import("../../src/app/therapies/page")).default;

afterEach(() => {
  vi.mocked(listTherapiesWithAilments).mockReset();
});

const seeded = [
  {
    id: "therapy-1",
    name: "Mindful temperature reduction",
    description: "A guided session lowering temperature.",
    durationMinutes: 30,
    createdAt: new Date(),
    updatedAt: new Date(),
    ailments: [
      {
        therapyId: "therapy-1",
        ailmentId: "a-1",
        ailment: {
          id: "a-1",
          name: "Hallucination flare-up",
          severity: "severe" as const,
          description: "",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      },
    ],
  },
];

describe("/therapies renders the bidirectional catalog", () => {
  test("shows seeded therapy names and the ailment chip it treats", async () => {
    vi.mocked(listTherapiesWithAilments).mockResolvedValue(seeded as never);
    const html = renderToString(await TherapiesPage());
    expect(html).toContain("Mindful temperature reduction");
    expect(html).toContain("Hallucination flare-up");
    expect(html).toMatch(/href="\/ailments#ailment-a-1"/);
    expect(html).toMatch(/id="therapy-therapy-1"/);
    expect(html).toContain("30");
    expect(html).toContain("min");
  });
});
