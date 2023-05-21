import React from 'react';
import { cn, PlateElement, PlateElementProps } from '@udecode/plate-tailwind';

export function ParagraphElement({ className, ...props }: PlateElementProps) {
  return (
    <PlateElement
      as="p"
      className={cn('m-0 px-0 py-1', className)}
      {...props}
    />
  );
}
