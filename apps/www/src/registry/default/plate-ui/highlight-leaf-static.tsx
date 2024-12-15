import React from 'react';

import type { PlateLeafStaticProps } from '@udecode/plate-core';

import { cn } from '@udecode/cn';
import { PlateLeafStatic } from '@udecode/plate-common';

export function HighlightLeafStatic({
  children,
  className,
  ...props
}: PlateLeafStaticProps) {
  return (
    <PlateLeafStatic
      className={cn('bg-highlight/30 text-inherit', className)}
      {...props}
    >
      <mark>{children}</mark>
    </PlateLeafStatic>
  );
}
