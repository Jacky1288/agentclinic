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

export async function listTherapies() {
  return db.therapy.findMany({ orderBy: { name: "asc" } });
}

export async function getTherapy(id: string) {
  return db.therapy.findUnique({ where: { id } });
}
