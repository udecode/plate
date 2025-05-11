'use client';

import * as React from 'react';

import { DndPlugin } from '@udecode/plate-dnd';
import { useBlockSelected } from '@udecode/plate-selection/react';
import { usePluginOption } from '@udecode/plate/react';
import { type VariantProps, cva } from 'class-variance-authority';

import { cn } from '@/lib/utils';

export const blockSelectionVariants = cva(
  'pointer-events-none absolute inset-0 z-1 bg-brand/[.13] transition-opacity',
  {
    defaultVariants: {
      active: true,
    },
    variants: {
      active: {
        false: 'opacity-0',
        true: 'opacity-100',
      },
    },
  }
);

export function BlockSelection({
  className,
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof blockSelectionVariants>) {
  const isBlockSelected = useBlockSelected();
  const isDragging = usePluginOption(DndPlugin, 'isDragging');

  if (!isBlockSelected) return null;

  return (
    <div
      className={cn(
        blockSelectionVariants({
          active: isBlockSelected && !isDragging,
        }),
        className
      )}
      data-slot="block-selection"
      {...props}
    />
  );
}
