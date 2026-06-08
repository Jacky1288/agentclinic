import Link from "next/link";

const navLinks = [
  { href: "/agents", label: "Agents" },
  { href: "/ailments", label: "Ailments" },
  { href: "/therapies", label: "Therapies" },
  { href: "/book", label: "Book" },
  { href: "/feedback", label: "Feedback" },
  { href: "/dashboard", label: "Dashboard" },
];

export function Header() {
  return (
    <header className="main-layout__header">
      <div className="main-layout__rail flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        <Link
          href="/"
          className="text-base font-semibold tracking-tight hover:underline"
        >
          AgentClinic
        </Link>
        <nav aria-label="Primary">
          <ul className="flex list-none flex-wrap gap-x-4 gap-y-1 text-sm text-slate-600 dark:text-slate-300">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="hover:underline">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <span className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
          Open daily
        </span>
      </div>
    </header>
  );
}
