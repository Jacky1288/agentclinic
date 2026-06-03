import type { ReactNode } from "react";

type MainProps = {
  children: ReactNode;
};

export function Main({ children }: MainProps) {
  return (
    <main className="main-layout__main">
      <div className="main-layout__rail flex flex-1 flex-col justify-center py-16">
        {children}
      </div>
    </main>
  );
}
