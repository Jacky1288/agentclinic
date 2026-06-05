import { db } from "@/lib/db";

export async function listAilmentsWithTherapies() {
  return db.ailment.findMany({
    orderBy: { name: "asc" },
    include: {
      therapies: {
        include: { therapy: true },
        orderBy: { therapy: { name: "asc" } },
      },
    },
  });
}

export type AilmentWithTherapies = Awaited<
  ReturnType<typeof listAilmentsWithTherapies>
>[number];
