import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { listAgents, type AgentRow } from "@/lib/queries/agents";
import { setAgentArchived } from "./actions";

type SearchParams = Promise<{ archived?: string }>;

function formatDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function ArchiveButton({ agent, archived }: { agent: AgentRow; archived: boolean }) {
  return (
    <form action={setAgentArchived} className="inline-flex">
      <input type="hidden" name="id" value={agent.id} />
      <input type="hidden" name="archive" value={archived ? "false" : "true"} />
      <Button type="submit" variant="ghost" size="sm">
        {archived ? "Unarchive" : "Archive"}
      </Button>
    </form>
  );
}

export default async function AgentsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const archived = params.archived === "1";
  const agents = await listAgents({ archived });

  return (
    <section className="main-layout__rail w-full py-8 sm:py-12">
      <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <p className="text-xs sm:text-sm font-medium uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
            Staff
          </p>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
            Agents on the roster
          </h1>
          <p className="max-w-2xl text-sm sm:text-base text-slate-600 dark:text-slate-400">
            {archived
              ? "Archived agents. Restore one to bring them back into rotation."
              : "Active intake list. Add a new patient or open a record to edit it."}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={archived ? "/agents" : "/agents?archived=1"}
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            {archived ? "Show active" : "Show archived"}
          </Link>
          <Link href="/agents/new" className={cn(buttonVariants({ size: "sm" }))}>
            New agent
          </Link>
        </div>
      </header>

      {agents.length === 0 ? (
        <p className="rounded-md border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500 dark:border-slate-700">
          {archived
            ? "No archived agents."
            : "No agents on the roster yet. Add the first one."}
        </p>
      ) : (
        <>
          {/* Mobile: stacked cards */}
          <ul className="space-y-3 sm:hidden">
            {agents.map((agent) => (
              <li
                key={agent.id}
                className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-base font-semibold">{agent.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {agent.modelFamily}
                    </p>
                  </div>
                  <ArchiveButton agent={agent} archived={archived} />
                </div>
                <dl className="mt-3 grid grid-cols-2 gap-x-2 gap-y-1 text-xs">
                  <dt className="text-slate-500">Intake</dt>
                  <dd>{formatDate(agent.intakeDate)}</dd>
                  {agent.archivedAt ? (
                    <>
                      <dt className="text-slate-500">Archived</dt>
                      <dd>{formatDate(agent.archivedAt)}</dd>
                    </>
                  ) : null}
                </dl>
                <div className="mt-3">
                  <Link
                    href={`/agents/${agent.id}/edit`}
                    className={cn(
                      buttonVariants({ variant: "outline", size: "sm" }),
                      "w-full",
                    )}
                  >
                    Edit
                  </Link>
                </div>
              </li>
            ))}
          </ul>

          {/* Tablet and up: table */}
          <div className="hidden rounded-lg border border-slate-200 dark:border-slate-800 sm:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Model family</TableHead>
                  <TableHead>Intake</TableHead>
                  {archived ? <TableHead>Archived</TableHead> : null}
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {agents.map((agent) => (
                  <TableRow key={agent.id}>
                    <TableCell className="font-medium">{agent.name}</TableCell>
                    <TableCell>{agent.modelFamily}</TableCell>
                    <TableCell>{formatDate(agent.intakeDate)}</TableCell>
                    {archived ? (
                      <TableCell>
                        {agent.archivedAt
                          ? formatDate(agent.archivedAt)
                          : "—"}
                      </TableCell>
                    ) : null}
                    <TableCell className="text-right">
                      <div className="inline-flex items-center gap-1">
                        <Link
                          href={`/agents/${agent.id}/edit`}
                          className={cn(
                            buttonVariants({ variant: "ghost", size: "sm" }),
                          )}
                        >
                          Edit
                        </Link>
                        <ArchiveButton agent={agent} archived={archived} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </section>
  );
}
