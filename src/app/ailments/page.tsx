import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { listAilmentsWithTherapies } from "@/lib/queries/ailments";

export const metadata = {
  title: "Ailments — AgentClinic",
  description:
    "What's wrong with the patient today: prompt fatigue, context exhaustion, hallucination flare-ups, and more.",
};

export default async function AilmentsPage() {
  const ailments = await listAilmentsWithTherapies();

  return (
    <section className="main-layout__rail w-full py-8 sm:py-12">
      <header className="mb-8 space-y-2">
        <p className="text-xs sm:text-sm font-medium uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
          Catalog
        </p>
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
          Ailments we treat
        </h1>
        <p className="max-w-2xl text-sm sm:text-base text-slate-600 dark:text-slate-400">
          Common complaints presented at intake. Severity ratings are clinical
          best-guesses; mileage varies by deployment.
        </p>
      </header>

      <ul className="grid list-none grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ailments.map((a) => (
          <li key={a.id} id={`ailment-${a.id}`}>
            <Card className="h-full">
              <CardHeader>
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <CardTitle>{a.name}</CardTitle>
                  <Badge variant={a.severity}>{a.severity}</Badge>
                </div>
                <CardDescription>{a.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-2 text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Treated by
                </p>
                {a.therapies.length === 0 ? (
                  <p className="text-sm text-slate-500">No therapies yet.</p>
                ) : (
                  <ul className="flex list-none flex-wrap gap-2">
                    {a.therapies.map((link) => (
                      <li key={link.therapy.id}>
                        <Link
                          href={`/therapies#therapy-${link.therapy.id}`}
                          className="inline-flex items-center rounded-full border border-slate-300 px-2.5 py-0.5 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                        >
                          {link.therapy.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>
    </section>
  );
}
