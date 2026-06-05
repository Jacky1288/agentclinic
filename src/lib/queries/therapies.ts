import { db } from "@/lib/db";

export async function listTherapiesWithAilments() {
  return db.therapy.findMany({
    orderBy: { name: "asc" },
    include: {
      ailments: {
        include: { ailment: true },
        orderBy: { ailment: { name: "asc" } },
      },
    },
  });
}

export type TherapyWithAilments = Awaited<
  ReturnType<typeof listTherapiesWithAilments>
>[number];
