import { notFound } from "next/navigation";
import { AgentForm } from "@/components/agents/AgentForm";
import { getAgent } from "@/lib/queries/agents";
import { updateAgent } from "../../actions";

export const metadata = {
  title: "Edit agent — AgentClinic",
};

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditAgentPage({ params }: PageProps) {
  const { id } = await params;
  const agent = await getAgent(id);
  if (!agent || agent.archivedAt) {
    notFound();
  }

  return (
    <section className="main-layout__rail w-full py-8 sm:py-12">
      <header className="mb-6 space-y-2">
        <p className="text-xs sm:text-sm font-medium uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
          Staff
        </p>
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
          Edit {agent.name}
        </h1>
      </header>
      <AgentForm
        action={updateAgent}
        submitLabel="Save changes"
        defaultValues={{
          id: agent.id,
          name: agent.name,
          modelFamily: agent.modelFamily,
          intakeDate: agent.intakeDate.toISOString(),
        }}
      />
    </section>
  );
}
