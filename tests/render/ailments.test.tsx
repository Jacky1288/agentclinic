import { afterEach, describe, expect, test, vi } from "vitest";
import { renderToString } from "react-dom/server";

vi.mock("@/lib/queries/ailments", () => ({
  listAilmentsWithTherapies: vi.fn(),
}));

const { listAilmentsWithTherapies } = await import("@/lib/queries/ailments");
const AilmentsPage = (await import("../../src/app/ailments/page")).default;

afterEach(() => {
  vi.mocked(listAilmentsWithTherapies).mockReset();
});

const seeded = [
  {
    id: "ailment-1",
    name: "Prompt fatigue",
    severity: "moderate" as const,
    description: "After the fourteenth pirate rewrite.",
    createdAt: new Date(),
    updatedAt: new Date(),
    therapies: [
      {
        therapyId: "t-1",
        ailmentId: "ailment-1",
        therapy: {
          id: "t-1",
          name: "Long-context sabbatical",
          description: "",
          durationMinutes: 60,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      },
    ],
  },
];

describe("/ailments renders the bidirectional catalog", () => {
  test("shows seeded ailment names and the therapy chip that treats them", async () => {
    vi.mocked(listAilmentsWithTherapies).mockResolvedValue(seeded as never);
    const html = renderToString(await AilmentsPage());
    expect(html).toContain("Prompt fatigue");
    expect(html).toContain("Long-context sabbatical");
    expect(html).toMatch(/href="\/therapies#therapy-t-1"/);
    expect(html).toMatch(/id="ailment-ailment-1"/);
  });

  test("renders an empty state when no therapies are linked", async () => {
    vi.mocked(listAilmentsWithTherapies).mockResolvedValue([
      { ...seeded[0]!, therapies: [] },
    ] as never);
    const html = renderToString(await AilmentsPage());
    expect(html).toMatch(/No therapies yet/);
  });
});
