'use client';

import * as React from 'react';

import { Index } from '@/__registry__';
import { cn } from '@/lib/utils';

export function BlockPageClient({
  containerClassName = 'size-full',
  name,
}: {
  containerClassName?: string;
  name: string;
}) {
  const Component = Index[name]?.component;

  if (!Component) {
    return null;
  }

  return (
    <div
      className={cn(
        'themes-wrapper bg-background **:data-block-hide:hidden',
        containerClassName
      )}
    >
      <React.Suspense fallback={null}>
        <Component />
      </React.Suspense>
    </div>
  );
}
