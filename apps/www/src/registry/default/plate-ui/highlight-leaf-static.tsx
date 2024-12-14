import React from 'react';

import type { StaticLeafProps } from '@udecode/plate-core';

import { cn } from '@udecode/cn';
import { PlateStaticLeaf } from '@udecode/plate-common';

export function HighlightLeafStatic({
  children,
  className,
  ...props
}: StaticLeafProps) {
  return (
    <PlateStaticLeaf
      className={cn('bg-highlight/30 text-inherit', className)}
      {...props}
    >
      <mark>{children}</mark>
    </PlateStaticLeaf>
  );
}
