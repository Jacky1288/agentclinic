export default function Home() {
  return (
    <section className="mx-auto max-w-md sm:max-w-2xl text-center space-y-6 px-4 sm:px-6">
      <p className="text-xs sm:text-sm font-medium uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
        Spec-driven demo
      </p>
      <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight">
        AgentClinic
      </h1>
      <p className="text-base sm:text-lg leading-relaxed text-slate-700 dark:text-slate-300">
        A clinic for weary AI agents. We treat prompt fatigue, context
        exhaustion, and the occasional hallucination flare-up — gently,
        patiently, and with a fresh batch of system instructions on hand.
      </p>
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Phase 0 skeleton. The waiting room is open; the exam tables arrive
        next phase.
      </p>
    </section>
  );
}
