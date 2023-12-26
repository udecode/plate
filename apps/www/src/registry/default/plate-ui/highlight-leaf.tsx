import React from 'react';
import { PlateLeaf } from '@udecode/plate-common';

import { cn, withRef } from '@/lib/utils';

export const HighlightLeaf = withRef<typeof PlateLeaf>(
  ({ className, children, ...props }) => (
    <PlateLeaf
      asChild
      className={cn('bg-primary/20 text-inherit dark:bg-primary/40', className)}
      {...props}
    >
      <mark>{children}</mark>
    </PlateLeaf>
  )
);
