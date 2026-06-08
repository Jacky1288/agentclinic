import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAgent } from "@/lib/queries/agents";
import { getTherapy } from "@/lib/queries/therapies";
import {
  dayKey,
  groupSlotsByDay,
  listAvailableSlots,
  type SlotRow,
} from "@/lib/queries/slots";
import { bookAppointment } from "../../actions";

type Params = Promise<{ agentId: string; therapyId: string }>;

function formatTime(d: Date): string {
  const h = String(d.getHours()).padStart(2, "0");
  const m = String(d.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

function dayHeading(date: Date): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (dayKey(date) === dayKey(today)) return "Today";
  if (dayKey(date) === dayKey(tomorrow)) return "Tomorrow";
  return date.toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

export default async function BookSlotStepPage({
  params,
}: {
  params: Params;
}) {
  const { agentId, therapyId } = await params;
  const [agent, therapy] = await Promise.all([
    getAgent(agentId),
    getTherapy(therapyId),
  ]);
  if (!agent || agent.archivedAt || !therapy) notFound();

  const slots = await listAvailableSlots({ agentId });
  const grouped = groupSlotsByDay(slots);
  const dayKeys = Array.from(grouped.keys());

  return (
    <section className="main-layout__rail w-full py-8 sm:py-12">
      <header className="mb-8 space-y-2">
        <p className="text-xs sm:text-sm font-medium uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
          Booking · Step 3 of 3
        </p>
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
          Pick a time for {agent.name}
        </h1>
        <p className="max-w-2xl text-sm sm:text-base text-slate-600 dark:text-slate-400">
          {therapy.name} · {therapy.durationMinutes} min. Click a slot to
          confirm.
        </p>
      </header>

      {dayKeys.length === 0 ? (
        <p className="rounded-md border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500 dark:border-slate-700">
          No openings. The agent is booked solid — please try another agent or
          check back tomorrow.
        </p>
      ) : (
        <div className="space-y-8">
          {dayKeys.map((key) => {
            const daySlots = grouped.get(key) ?? [];
            const first = daySlots[0];
            if (!first) return null;
            return (
              <Card key={key}>
                <CardHeader>
                  <CardTitle>{dayHeading(first.startsAt)}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="grid list-none grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-6">
                    {daySlots.map((slot: SlotRow) => (
                      <li key={slot.id}>
                        <form action={bookAppointment}>
                          <input type="hidden" name="agentId" value={agent.id} />
                          <input
                            type="hidden"
                            name="therapyId"
                            value={therapy.id}
                          />
                          <input type="hidden" name="slotId" value={slot.id} />
                          <Button
                            type="submit"
                            variant="outline"
                            className="w-full min-h-11"
                          >
                            {formatTime(slot.startsAt)}
                          </Button>
                        </form>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </section>
  );
}
