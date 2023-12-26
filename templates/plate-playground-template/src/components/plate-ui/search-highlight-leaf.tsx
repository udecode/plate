import React from 'react';
import { cn } from '@udecode/cn';
import { PlateLeaf, PlateLeafProps } from '@udecode/plate-common';

export function SearchHighlightLeaf({ className, ...props }: PlateLeafProps) {
  return <PlateLeaf className={cn('bg-yellow-100', className)} {...props} />;
}
