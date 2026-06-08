import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import {
  listTodaysAppointments,
  listUpcomingByDay,
  type AppointmentRow,
  type UpcomingDay,
} from "@/lib/queries/appointments";
import { cancelAppointment } from "./actions";

function formatTime(d: Date): string {
  const h = String(d.getHours()).padStart(2, "0");
  const m = String(d.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

function dayLetter(d: Date): string {
  return d
    .toLocaleDateString(undefined, { weekday: "short" })
    .slice(0, 1)
    .toUpperCase();
}

function CancelButton({ id }: { id: string }) {
  return (
    <form action={cancelAppointment} className="inline-flex">
      <input type="hidden" name="id" value={id} />
      <Button type="submit" variant="ghost" size="sm">
        Cancel
      </Button>
    </form>
  );
}

function TodayCard({ rows }: { rows: AppointmentRow[] }) {
  if (rows.length === 0) {
    return (
      <p className="rounded-md border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500 dark:border-slate-700">
        No appointments today. The agents are recovering.
      </p>
    );
  }
  return (
    <>
      {/* Mobile: stacked cards */}
      <ul className="space-y-3 sm:hidden">
        {rows.map((appt) => (
          <li
            key={appt.id}
            className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-base font-semibold">{appt.agent.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {appt.therapy.name}
                </p>
              </div>
              <CancelButton id={appt.id} />
            </div>
            <p className="mt-2 text-xs text-slate-500">
              {formatTime(appt.slot.startsAt)}
            </p>
          </li>
        ))}
      </ul>

      {/* Tablet and up: table */}
      <div className="hidden rounded-lg border border-slate-200 dark:border-slate-800 sm:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Time</TableHead>
              <TableHead>Agent</TableHead>
              <TableHead>Therapy</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((appt) => (
              <TableRow key={appt.id}>
                <TableCell className="font-medium">
                  {formatTime(appt.slot.startsAt)}
                </TableCell>
                <TableCell>{appt.agent.name}</TableCell>
                <TableCell>{appt.therapy.name}</TableCell>
                <TableCell className="text-right">
                  <CancelButton id={appt.id} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}

function UpcomingChart({ days }: { days: UpcomingDay[] }) {
  const max = Math.max(1, ...days.map((d) => d.count));
  return (
    <ul
      className="flex h-40 list-none items-end gap-2"
      aria-label="Booked appointments per day for the next week"
    >
      {days.map((day) => {
        const ratio = day.count / max;
        const heightPct = day.count === 0 ? 4 : Math.max(8, ratio * 100);
        return (
          <li
            key={day.date.toISOString()}
            className="flex flex-1 min-w-6 flex-col items-center justify-end gap-1 text-center"
          >
            <span className="text-xs font-medium tabular-nums">
              {day.count}
            </span>
            <div
              className="w-full min-h-1 rounded-t bg-slate-300 dark:bg-slate-700"
              style={{ height: `${heightPct}%` }}
              aria-hidden="true"
            />
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {dayLetter(day.date)}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

const quickLinks = [
  { href: "/agents", label: "Agents" },
  { href: "/ailments", label: "Ailments" },
  { href: "/therapies", label: "Therapies" },
  { href: "/book", label: "Book" },
];

export const metadata = {
  title: "Staff dashboard — AgentClinic",
  description:
    "Today's appointments, this week's load, and quick links to the rest of the clinic.",
};

export default async function DashboardPage() {
  const [todays, upcoming] = await Promise.all([
    listTodaysAppointments(),
    listUpcomingByDay({ days: 7 }),
  ]);

  return (
    <section className="main-layout__rail w-full py-8 sm:py-12">
      <header className="mb-8 space-y-2">
        <p className="text-xs sm:text-sm font-medium uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
          Staff
        </p>
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
          Today at AgentClinic
        </h1>
        <p className="max-w-2xl text-sm sm:text-base text-slate-600 dark:text-slate-400">
          Who&rsquo;s in, what&rsquo;s booked, and where to go next.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Today</CardTitle>
            <CardDescription>
              Booked sessions in clinic today, in chronological order.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TodayCard rows={todays} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>This week</CardTitle>
            <CardDescription>
              Booked sessions per day for the next 7 days.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <UpcomingChart days={upcoming} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Quick links</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="flex list-none flex-wrap gap-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={cn(buttonVariants({ variant: "outline" }))}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
