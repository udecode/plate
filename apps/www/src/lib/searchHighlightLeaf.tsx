import React from 'react';
import { cn, PlateLeaf, PlateLeafProps } from '@udecode/plate-tailwind';

export function SearchHighlightLeaf({ className, ...props }: PlateLeafProps) {
  return <PlateLeaf className={cn('bg-[#fff59d]', className)} {...props} />;
}
