'use client';

import React from 'react';
import { PlateLeaf, PlateLeafProps } from '@udecode/plate-common';

import { cn } from '@/lib/utils';

export function CodeLeaf({ className, children, ...props }: PlateLeafProps) {
  return (
    <PlateLeaf
      asChild
      className={cn(
        'whitespace-pre-wrap',
        'rounded-md bg-muted px-[0.3em] py-[0.2em] font-mono text-sm',
        className
      )}
      {...props}
    >
      <code>{children}</code>
    </PlateLeaf>
  );
}
