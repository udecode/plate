'use client';

import type { ComponentProps } from 'react';

import dynamic from 'next/dynamic';

const ComponentPreview = dynamic(
  () =>
    import('./component-preview').then((mod) => mod.ComponentPreview),
  {
    loading: () => (
      <div className="mt-4 mb-12 text-sm text-muted-foreground">
        Loading preview...
      </div>
    ),
    ssr: false,
  }
);

export function ClientComponentPreview(
  props: ComponentProps<typeof ComponentPreview>
) {
  return <ComponentPreview {...props} />;
}
