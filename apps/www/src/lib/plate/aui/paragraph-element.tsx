import React from 'react';
import { PlateElement } from '@udecode/plate';
import { PlateElementProps } from '@udecode/plate-common';

import { cn } from '@/lib/utils';

export function ParagraphElement({ className, ...props }: PlateElementProps) {
  return (
    <PlateElement
      as="p"
      className={cn('m-0 px-0 py-1', className)}
      {...props}
    />
  );
}
