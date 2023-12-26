'use client';

import React from 'react';
import { PlateLeaf } from '@udecode/plate-common';

import { cn, withRef } from '@/lib/utils';

export const CodeLeaf = withRef(
  PlateLeaf,
  ({ className, children, ...props }) => {
    return (
      <PlateLeaf
        asChild
        className={cn(
          'whitespace-pre-wrap rounded-md bg-muted px-[0.3em] py-[0.2em] font-mono text-sm',
          className
        )}
        {...props}
      >
        <code>{children}</code>
      </PlateLeaf>
    );
  }
);
