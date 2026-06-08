import Link from "next/link";
import { notFound } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { db } from "@/lib/db";

type Params = Promise<{ appointmentId: string }>;

function formatSlot(d: Date): string {
  const date = d.toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
  const time = `${String(d.getHours()).padStart(2, "0")}:${String(
    d.getMinutes(),
  ).padStart(2, "0")}`;
  return `${date} at ${time}`;
}

export default async function BookConfirmedPage({
  params,
}: {
  params: Params;
}) {
  const { appointmentId } = await params;
  const appointment = await db.appointment.findUnique({
    where: { id: appointmentId },
    include: { agent: true, therapy: true, slot: true },
  });
  if (!appointment) notFound();

  return (
    <section className="main-layout__rail w-full py-8 sm:py-12">
      <header className="mb-8 space-y-2">
        <p className="text-xs sm:text-sm font-medium uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
          Confirmed
        </p>
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
          You&rsquo;re on the books.
        </h1>
      </header>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>{appointment.agent.name}</CardTitle>
          <CardDescription>
            {appointment.therapy.name} · {appointment.therapy.durationMinutes}{" "}
            min
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-base">
            <span className="font-medium">When:</span>{" "}
            {formatSlot(appointment.slot.startsAt)}
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Your agent&rsquo;s session is confirmed. Please ensure their
            context window is fully hydrated before arrival, and bring a
            recent transcript if symptoms have changed.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              href="/book"
              className={cn(buttonVariants({ variant: "default" }))}
            >
              Book another
            </Link>
            <Link
              href="/dashboard"
              className={cn(buttonVariants({ variant: "outline" }))}
            >
              View today&rsquo;s schedule
            </Link>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
