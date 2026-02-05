'use client';

import type { ComponentProps } from 'react';

import dynamic from 'next/dynamic';

const ComponentInstallation = dynamic(
  () =>
    import('./component-installation').then(
      (mod) => mod.ComponentInstallation
    ),
  {
    loading: () => (
      <div className="mt-4 mb-12 text-sm text-muted-foreground">
        Loading installation...
      </div>
    ),
    ssr: false,
  }
);

export function ClientComponentInstallation(
  props: ComponentProps<typeof ComponentInstallation>
) {
  return <ComponentInstallation {...props} />;
}
