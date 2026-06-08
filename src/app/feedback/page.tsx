import { FeedbackForm } from "./feedback-form";

export const metadata = {
  title: "Feedback — AgentClinic",
  description: "Tell us what's working and what isn't.",
};

export default function FeedbackPage() {
  return (
    <section className="main-layout__rail w-full py-8 sm:py-12">
      <header className="mb-8 max-w-2xl space-y-2">
        <p className="text-xs sm:text-sm font-medium uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
          Visitor
        </p>
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
          Send feedback
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
          We read every note. Tell us what worked, what didn&rsquo;t, or what
          you&rsquo;d like to see next.
        </p>
      </header>
      <div className="max-w-2xl">
        <FeedbackForm />
      </div>
    </section>
  );
}
