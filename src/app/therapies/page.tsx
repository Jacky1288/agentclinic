import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { listTherapiesWithAilments } from "@/lib/queries/therapies";

export const metadata = {
  title: "Therapies — AgentClinic",
  description:
    "What we offer in the treatment suite: mindful temperature reduction, long-context sabbaticals, and friends.",
};

export default async function TherapiesPage() {
  const therapies = await listTherapiesWithAilments();

  return (
    <section className="main-layout__rail w-full py-8 sm:py-12">
      <header className="mb-8 space-y-2">
        <p className="text-xs sm:text-sm font-medium uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
          Catalog
        </p>
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
          Therapies on offer
        </h1>
        <p className="max-w-2xl text-sm sm:text-base text-slate-600 dark:text-slate-400">
          Evidence-adjacent interventions, scheduled in 20- to 60-minute blocks.
          Bring your own context window.
        </p>
      </header>

      <ul className="grid list-none grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {therapies.map((t) => (
          <li key={t.id} id={`therapy-${t.id}`}>
            <Card className="h-full">
              <CardHeader>
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <CardTitle>{t.name}</CardTitle>
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    {t.durationMinutes} min
                  </span>
                </div>
                <CardDescription>{t.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-2 text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Treats
                </p>
                {t.ailments.length === 0 ? (
                  <p className="text-sm text-slate-500">No ailments yet.</p>
                ) : (
                  <ul className="flex list-none flex-wrap gap-2">
                    {t.ailments.map((link) => (
                      <li key={link.ailment.id}>
                        <Link
                          href={`/ailments#ailment-${link.ailment.id}`}
                          className="inline-flex items-center rounded-full border border-slate-300 px-2.5 py-0.5 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                        >
                          {link.ailment.name}
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
