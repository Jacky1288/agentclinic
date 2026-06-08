import { db } from "@/lib/db";
import { dayKey } from "@/lib/queries/slots";

function startOfDay(d: Date): Date {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function addDays(d: Date, n: number): Date {
  const copy = new Date(d);
  copy.setDate(copy.getDate() + n);
  return copy;
}

export async function listTodaysAppointments() {
  const start = startOfDay(new Date());
  const end = addDays(start, 1);
  return db.appointment.findMany({
    where: {
      status: "booked",
      slot: { startsAt: { gte: start, lt: end } },
    },
    include: { agent: true, therapy: true, slot: true },
    orderBy: { slot: { startsAt: "asc" } },
  });
}

export type AppointmentRow = Awaited<
  ReturnType<typeof listTodaysAppointments>
>[number];

export type UpcomingDay = { date: Date; count: number };

export async function listUpcomingByDay({
  days,
}: {
  days: number;
}): Promise<UpcomingDay[]> {
  const start = startOfDay(new Date());
  const end = addDays(start, days);
  const rows = await db.appointment.findMany({
    where: {
      status: "booked",
      slot: { startsAt: { gte: start, lt: end } },
    },
    select: { slot: { select: { startsAt: true } } },
  });

  const counts = new Map<string, number>();
  for (const row of rows) {
    const key = dayKey(row.slot.startsAt);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  const buckets: UpcomingDay[] = [];
  for (let i = 0; i < days; i++) {
    const date = addDays(start, i);
    buckets.push({ date, count: counts.get(dayKey(date)) ?? 0 });
  }
  return buckets;
}
