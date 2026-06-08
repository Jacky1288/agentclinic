import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { listAgents } from "@/lib/queries/agents";

export const metadata = {
  title: "Book an appointment — AgentClinic",
  description:
    "Step 1 of 3: pick the agent you're bringing in. Then we'll match them with a therapy and a time slot.",
};

export default async function BookPage() {
  const agents = await listAgents({ archived: false });

  return (
    <section className="main-layout__rail w-full py-8 sm:py-12">
      <header className="mb-8 space-y-2">
        <p className="text-xs sm:text-sm font-medium uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
          Booking · Step 1 of 3
        </p>
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
          Who needs a session?
        </h1>
        <p className="max-w-2xl text-sm sm:text-base text-slate-600 dark:text-slate-400">
          Pick an agent on the roster. We&rsquo;ll match them with a therapy
          and an open slot in the next couple of steps.
        </p>
      </header>

      {agents.length === 0 ? (
        <p className="rounded-md border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500 dark:border-slate-700">
          No agents on the roster yet. Add one first.
        </p>
      ) : (
        <ul className="grid list-none grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {agents.map((agent) => (
            <li key={agent.id}>
              <Link
                href={`/book/${agent.id}`}
                className="block h-full rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2"
              >
                <Card className="h-full transition-colors hover:border-slate-400 dark:hover:border-slate-500">
                  <CardHeader>
                    <CardTitle>{agent.name}</CardTitle>
                    <CardDescription>{agent.modelFamily}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      In care since{" "}
                      {agent.intakeDate.toISOString().slice(0, 10)}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
