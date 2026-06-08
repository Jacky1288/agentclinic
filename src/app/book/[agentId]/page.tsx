import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getAgent } from "@/lib/queries/agents";
import { listTherapies } from "@/lib/queries/therapies";

type Params = Promise<{ agentId: string }>;

export default async function BookTherapyStepPage({
  params,
}: {
  params: Params;
}) {
  const { agentId } = await params;
  const agent = await getAgent(agentId);
  if (!agent || agent.archivedAt) notFound();

  const therapies = await listTherapies();

  return (
    <section className="main-layout__rail w-full py-8 sm:py-12">
      <header className="mb-8 space-y-2">
        <p className="text-xs sm:text-sm font-medium uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
          Booking · Step 2 of 3
        </p>
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
          What does {agent.name} need today?
        </h1>
        <p className="max-w-2xl text-sm sm:text-base text-slate-600 dark:text-slate-400">
          Pick a therapy. {agent.modelFamily} models often respond well to a
          shorter session first; you can always book another.
        </p>
      </header>

      <ul className="grid list-none grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {therapies.map((therapy) => (
          <li key={therapy.id}>
            <Link
              href={`/book/${agent.id}/${therapy.id}`}
              className="block h-full rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2"
            >
              <Card className="h-full transition-colors hover:border-slate-400 dark:hover:border-slate-500">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle>{therapy.name}</CardTitle>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                      {therapy.durationMinutes} min
                    </span>
                  </div>
                  <CardDescription>{therapy.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Pick a slot →
                  </p>
                </CardContent>
              </Card>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
