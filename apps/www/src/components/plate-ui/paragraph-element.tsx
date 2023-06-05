import React from 'react';
import { PlateElement, PlateElementProps } from '@udecode/plate-common';

import { cn } from '@/lib/utils';

export function ParagraphElement({
  className,
  children,
  ...props
}: PlateElementProps) {
  return (
    <PlateElement asChild className={cn('m-0 px-0 py-1', className)} {...props}>
      <p>{children}</p>
    </PlateElement>
  );
}
