import React from 'react';
import { withRef, withVariants } from '@udecode/cn';
import { PlateElement } from '@udecode/plate-common/react';
import { cva } from 'class-variance-authority';

const listVariants = cva('m-0 ps-6', {
  variants: {
    variant: {
      ol: 'list-decimal',
      ul: 'list-disc [&_ul]:list-[circle] [&_ul_ul]:list-[square]',
    },
  },
});

const ListElementVariants = withVariants(PlateElement, listVariants, [
  'variant',
]);

export const ListElement = withRef<typeof ListElementVariants>(
  ({ children, variant = 'ul', ...props }, ref) => {
    const Component = variant!;

    return (
      <ListElementVariants asChild ref={ref} variant={variant} {...props}>
        <Component>{children}</Component>
      </ListElementVariants>
    );
  }
);
