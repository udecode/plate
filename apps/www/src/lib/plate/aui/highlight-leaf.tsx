import React from 'react';
import { PlateLeaf, PlateLeafProps } from '@udecode/plate';

import { cn } from '@/lib/utils';

export function HighlightLeaf({ className, ...props }: PlateLeafProps) {
  return (
    <PlateLeaf as="mark" className={cn('bg-[#FEF3B7]', className)} {...props} />
  );
}
