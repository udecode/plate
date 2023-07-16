import React from 'react';
import { PlateLeaf, PlateLeafProps } from '@udecode/plate-common';

import { cn } from '@/lib/utils';

export function HighlightLeaf({
  className,
  children,
  ...props
}: PlateLeafProps) {
  return (
    <PlateLeaf asChild className={cn('bg-yellow-200', className)} {...props}>
      <mark>{children}</mark>
    </PlateLeaf>
  );
}
