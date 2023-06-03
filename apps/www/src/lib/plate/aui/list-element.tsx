import React from 'react';
import { PlateElement } from '@udecode/plate';
import { PlateElementProps } from '@udecode/plate-common';
import { cva, VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const listVariants = cva('m-0 ps-6', {
  variants: {
    variant: {
      ul: 'list-disc [&_ul]:list-[circle] [&_ul_ul]:list-[square]',
      ol: 'list-decimal',
    },
  },
});

export function ListElement({
  className,
  variant = 'ul',
  ...props
}: PlateElementProps & VariantProps<typeof listVariants>) {
  return (
    <PlateElement
      as={variant}
      className={cn(listVariants({ variant }), className)}
      {...props}
    />
  );
}
