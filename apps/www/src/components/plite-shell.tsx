import type { ReactNode } from 'react';

export function PliteShell({ children }: { children: ReactNode }) {
  return (
    <div
      className="min-h-svh bg-background"
      data-editor-mode="true"
      data-slot="plite-layout"
    >
      {children}
    </div>
  );
}
