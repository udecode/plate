'use client';

import * as React from 'react';

import type { PlateElementProps } from '@udecode/plate/react';

import { withProps } from '@udecode/cn';
import { PlateElement } from '@udecode/plate/react';
import { type VariantProps, cva } from 'class-variance-authority';

const headingVariants = cva('relative mb-1', {
  variants: {
    variant: {
      h1: 'mt-[1.6em] pb-1 font-heading text-4xl font-bold',
      h2: 'mt-[1.4em] pb-px font-heading text-2xl font-semibold tracking-tight',
      h3: 'mt-[1em] pb-px font-heading text-xl font-semibold tracking-tight',
      h4: 'mt-[0.75em] font-heading text-lg font-semibold tracking-tight',
      h5: 'mt-[0.75em] text-lg font-semibold tracking-tight',
      h6: 'mt-[0.75em] text-base font-semibold tracking-tight',
    },
  },
});

export function HeadingElement({
  variant = 'h1',
  ...props
}: PlateElementProps & VariantProps<typeof headingVariants>) {
  return (
    <PlateElement
      as={variant!}
      className={headingVariants({ variant })}
      {...props}
    >
      {props.children}
    </PlateElement>
  );
}

export const H1Element = withProps(HeadingElement, { variant: 'h1' });
export const H2Element = withProps(HeadingElement, { variant: 'h2' });
export const H3Element = withProps(HeadingElement, { variant: 'h3' });
export const H4Element = withProps(HeadingElement, { variant: 'h4' });
export const H5Element = withProps(HeadingElement, { variant: 'h5' });
export const H6Element = withProps(HeadingElement, { variant: 'h6' });
