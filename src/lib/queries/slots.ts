import { db } from "@/lib/db";

export async function listAvailableSlots({ agentId }: { agentId: string }) {
  return db.slot.findMany({
    where: {
      agentId,
      startsAt: { gte: new Date() },
      appointments: { none: { status: "booked" } },
    },
    orderBy: { startsAt: "asc" },
  });
}

export type SlotRow = Awaited<ReturnType<typeof listAvailableSlots>>[number];

export function dayKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function groupSlotsByDay(slots: SlotRow[]): Map<string, SlotRow[]> {
  const grouped = new Map<string, SlotRow[]>();
  for (const slot of slots) {
    const key = dayKey(slot.startsAt);
    const bucket = grouped.get(key) ?? [];
    bucket.push(slot);
    grouped.set(key, bucket);
  }
  return grouped;
}
