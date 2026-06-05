import { AgentForm } from "@/components/agents/AgentForm";
import { createAgent } from "../actions";

export const metadata = {
  title: "New agent — AgentClinic",
};

export default function NewAgentPage() {
  return (
    <section className="main-layout__rail w-full py-8 sm:py-12">
      <header className="mb-6 space-y-2">
        <p className="text-xs sm:text-sm font-medium uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
          Staff
        </p>
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
          Intake form
        </h1>
        <p className="max-w-2xl text-sm sm:text-base text-slate-600 dark:text-slate-400">
          Welcome a new agent to the clinic. We&rsquo;ll book their first
          consultation later this phase.
        </p>
      </header>
      <AgentForm action={createAgent} submitLabel="Create agent" />
    </section>
  );
}
