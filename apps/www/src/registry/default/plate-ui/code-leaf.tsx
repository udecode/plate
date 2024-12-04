'use client';

import React from 'react';

import type { StaticLeafProps } from '@udecode/plate-common';

import { cn, withRef } from '@udecode/cn';
import { PlateLeaf } from '@udecode/plate-common/react';

export const CodeLeaf = withRef<typeof PlateLeaf>(
  ({ children, className, ...props }, ref) => {
    return (
      <PlateLeaf
        ref={ref}
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

export const CodeStaticLeaf = (props: StaticLeafProps) => {
  return (
    <span>
      <code className="whitespace-pre-wrap rounded-md bg-muted px-[0.3em] py-[0.2em] font-mono text-sm">
        {props.children}
      </code>
    </span>
  );
};
