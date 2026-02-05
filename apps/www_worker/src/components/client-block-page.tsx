'use client';

import type { ComponentProps } from 'react';

import dynamic from 'next/dynamic';

const BlockPageClient = dynamic(
  () => import('./block-page-client').then((mod) => mod.BlockPageClient),
  {
    loading: () => (
      <div className="flex min-h-[350px] items-center justify-center text-sm text-muted-foreground">
        Loading block...
      </div>
    ),
    ssr: false,
  }
);

export function ClientBlockPage(props: ComponentProps<typeof BlockPageClient>) {
  return <BlockPageClient {...props} />;
}
