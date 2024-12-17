import React from 'react';

import type { SlateElementProps } from '@udecode/plate-common';

import { cn } from '@udecode/cn';
import { SlateElement } from '@udecode/plate-common';

export function ColumnGroupElementStatic({
  children,
  className,
  element,
  ...props
}: SlateElementProps) {
  return (
    <SlateElement
      className={cn('my-2', className)}
      element={element}
      {...props}
    >
      <div className={cn('flex size-full gap-4 rounded')}>{children}</div>
    </SlateElement>
  );
}
