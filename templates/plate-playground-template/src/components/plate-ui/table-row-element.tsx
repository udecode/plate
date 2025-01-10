'use client';

import React from 'react';

import { cn, withRef } from '@udecode/cn';
import { PlateElement, useSelected } from '@udecode/plate/react';

export const TableRowElement = withRef<typeof PlateElement>(
  ({ children, className, ...props }, ref) => {
    const selected = useSelected();

    return (
      <PlateElement
        ref={ref}
        as="tr"
        className={cn(className, 'h-full')}
        data-selected={selected ? 'true' : undefined}
        {...props}
      >
        {children}
      </PlateElement>
    );
  }
);
