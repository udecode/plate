'use client';

import type { ComponentProps } from 'react';

import dynamic from 'next/dynamic';

const PlaygroundDemo = dynamic(
  () =>
    import('@/registry/examples/playground-demo').then(
      (mod) => mod.default || mod.PlaygroundDemo || mod
    ),
  {
    loading: () => (
      <div className="flex min-h-[350px] items-center justify-center text-sm text-muted-foreground">
        Loading playground...
      </div>
    ),
    ssr: false,
  }
);

export function ClientPlaygroundDemo(
  props: ComponentProps<typeof PlaygroundDemo>
) {
  return <PlaygroundDemo {...props} />;
}
