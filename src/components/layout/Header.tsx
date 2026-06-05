export function Header() {
  return (
    <header className="main-layout__header">
      <div className="main-layout__rail flex flex-col gap-1 py-4 sm:flex-row sm:items-baseline sm:justify-between sm:gap-0">
        <span className="text-base font-semibold tracking-tight">
          AgentClinic
        </span>
        <span className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
          Open daily
        </span>
      </div>
    </header>
  );
}
