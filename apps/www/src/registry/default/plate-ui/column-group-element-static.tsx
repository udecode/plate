import React from 'react';

import type { SlateElementProps } from '@udecode/plate';

import { cn } from '@udecode/cn';
import { SlateElement } from '@udecode/plate';

export function ColumnGroupElementStatic({
  children,
  className,
  ...props
}: SlateElementProps) {
  return (
    <SlateElement className={cn(className, 'my-2')} {...props}>
      <div className={cn('flex size-full gap-4 rounded')}>{children}</div>
    </SlateElement>
  );
}
