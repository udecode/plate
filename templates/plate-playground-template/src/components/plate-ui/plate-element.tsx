'use client';

import React from 'react';
import { cn } from '@udecode/cn';
import { PlateElement as PlateElementPrimitive } from '@udecode/plate-common/react';
import { useBlockSelectableStore } from '@udecode/plate-selection/react';

import { BlockSelection } from './block-selection';

import type { PlateElementProps } from '@udecode/plate-common/react';

export const PlateElement = React.forwardRef<HTMLDivElement, PlateElementProps>(
  ({ children, className, ...props }: PlateElementProps, ref) => {
    const selectable = useBlockSelectableStore().get.selectable();

    return (
      <PlateElementPrimitive
        ref={ref}
        className={cn('relative', className)}
        {...props}
      >
        {children}

        {selectable && <BlockSelection />}
      </PlateElementPrimitive>
    );
  }
);
