'use client';

import React from 'react';
import { PlateElement } from '@udecode/plate-common';

import { cn, withRef } from '@/lib/utils';

export const BlockquoteElement = withRef<typeof PlateElement>(
  ({ className, children, ...props }) => {
    return (
      <PlateElement
        asChild
        className={cn('my-1 border-l-2 pl-6 italic', className)}
        {...props}
      >
        <blockquote>{children}</blockquote>
      </PlateElement>
    );
  }
);
