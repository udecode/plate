import type { ReactNode } from 'react';

export function PliteShell({ children }: { children: ReactNode }) {
  return (
    <div
      className="min-h-svh bg-background has-data-[slot=designer]:flex has-data-[slot=designer]:h-svh has-data-[slot=designer]:flex-col has-data-[slot=designer]:overflow-hidden"
      data-editor-mode="true"
      data-slot="plite-layout"
    >
      {children}
    </div>
  );
}
