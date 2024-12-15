import React from 'react';

import type { PlateElementStaticProps } from '@udecode/plate-common';

import { cn } from '@udecode/cn';
import { PlateElementStatic } from '@udecode/plate-common';

export function ColumnGroupElementStatic({
  children,
  className,
  element,
  ...props
}: PlateElementStaticProps) {
  return (
    <PlateElementStatic
      className={cn('my-2', className)}
      element={element}
      {...props}
    >
      <div className={cn('flex size-full gap-4 rounded')}>{children}</div>
    </PlateElementStatic>
  );
}
