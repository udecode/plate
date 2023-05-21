import React from 'react';
import { cn, PlateLeaf, PlateLeafProps } from '@udecode/plate-tailwind';

export function HighlightLeaf({ className, ...props }: PlateLeafProps) {
  return (
    <PlateLeaf as="mark" className={cn('bg-[#FEF3B7]', className)} {...props} />
  );
}
