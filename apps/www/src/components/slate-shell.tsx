import type { ReactNode } from 'react';

export function SlateShell({ children }: { children: ReactNode }) {
  return (
    <div
      className="min-h-svh bg-background"
      data-slate-mode="true"
      data-slot="slate-layout"
    >
      {children}
    </div>
  );
}
