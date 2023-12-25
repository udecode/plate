import React from 'react';
import { PlateElement } from '@udecode/plate-common';
import { cva } from 'class-variance-authority';

import { withRef, withVariants } from '@/lib/utils';

const listVariants = cva('m-0 ps-6', {
  variants: {
    variant: {
      ul: 'list-disc [&_ul]:list-[circle] [&_ul_ul]:list-[square]',
      ol: 'list-decimal',
    },
  },
});

const ListElementVariants = withVariants(PlateElement, listVariants, [
  'variant',
]);

export const ListElement = withRef(
  ListElementVariants,
  ({ className, children, variant = 'ul', ...props }, ref) => {
    const Component = variant!;

    return (
      <ListElementVariants ref={ref} asChild {...props}>
        <Component>{children}</Component>
      </ListElementVariants>
    );
  }
);
