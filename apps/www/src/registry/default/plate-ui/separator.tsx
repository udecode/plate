'use client';

import * as SeparatorPrimitive from '@radix-ui/react-separator';
import { cva } from 'class-variance-authority';

import { withProps, withVariants } from '@/lib/utils';

const separatorVariants = cva('shrink-0 bg-border', {
  variants: {
    orientation: {
      horizontal: 'h-[1px] w-full',
      vertical: 'h-full w-[1px]',
    },
  },
  defaultVariants: {
    orientation: 'horizontal',
  },
});

export const Separator = withVariants(
  withProps(SeparatorPrimitive.Root, {
    orientation: 'horizontal',
    decorative: true,
  }),
  separatorVariants
);
