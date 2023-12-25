'use client';

import React from 'react';
import { PlateElement } from '@udecode/plate-common';

import { cn, withRef } from '@/lib/utils';

export const BlockquoteElement = withRef(
  PlateElement,
  ({ className, children, ...props }, ref) => {
    return (
      <PlateElement
        asChild
        ref={ref}
        className={cn('my-1 border-l-2 pl-6 italic', className)}
        {...props}
      >
        <blockquote>{children}</blockquote>
      </PlateElement>
    );
  }
);
