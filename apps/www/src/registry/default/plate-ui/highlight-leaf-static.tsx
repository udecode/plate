import React from 'react';

import type { SlateLeafProps } from '@udecode/plate-common';

import { cn } from '@udecode/cn';
import { SlateLeaf } from '@udecode/plate-common';

export function HighlightLeafStatic({
  children,
  className,
  ...props
}: SlateLeafProps) {
  return (
    <SlateLeaf
      className={cn('bg-highlight/30 text-inherit', className)}
      {...props}
    >
      <mark>{children}</mark>
    </SlateLeaf>
  );
}
