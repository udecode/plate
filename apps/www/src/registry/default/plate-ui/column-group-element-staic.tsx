import React from 'react';

import type { StaticElementProps } from '@udecode/plate-common';

import { cn } from '@udecode/cn';
import { PlateStaticElement } from '@udecode/plate-common';

export function ColumnGroupElementStatic({
  children,
  className,
  element,
  ...props
}: StaticElementProps) {
  return (
    <PlateStaticElement
      className={cn('my-2', className)}
      element={element}
      {...props}
    >
      <div className={cn('flex size-full gap-4 rounded')}>{children}</div>
    </PlateStaticElement>
  );
}
