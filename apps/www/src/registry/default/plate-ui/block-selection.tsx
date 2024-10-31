'use client';

import { useBlockSelected } from '@udecode/plate-selection/react';
import { type VariantProps, cva } from 'class-variance-authority';

const blockSelectionVariants = cva(
  'pointer-events-none absolute inset-0 z-[1] bg-brand/[.13] transition-opacity',
  {
    defaultVariants: {
      active: false,
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
}: React.HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof blockSelectionVariants>) {
  const isBlockSelected = useBlockSelected();

  if (!isBlockSelected) return null;

  return (
    <div
      className={blockSelectionVariants({
        active: isBlockSelected,
        className,
      })}
      {...props}
    />
  );
}
