import React from 'react';
import { cn } from '@udecode/cn';
import { PlateElement, PlateElementProps } from '@udecode/plate-common';
import { cva, VariantProps } from 'class-variance-authority';

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
  children,
  variant = 'ul',
  ...props
}: PlateElementProps & VariantProps<typeof listVariants>) {
  const Element = variant!;

  return (
    <PlateElement
      asChild
      className={cn(listVariants({ variant }), className)}
      {...props}
    >
      <Element>{children}</Element>
    </PlateElement>
  );
}
