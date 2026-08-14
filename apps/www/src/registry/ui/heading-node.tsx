'use client';

import * as React from 'react';

import type {
  H1Plugin,
  H2Plugin,
  H3Plugin,
  H4Plugin,
  H5Plugin,
  H6Plugin,
} from '@platejs/basic-nodes/react';
import type { PlateElementProps } from 'platejs/react';

import { type VariantProps, cva } from 'class-variance-authority';
import { PlateElement } from 'platejs/react';

const headingVariants = cva(
  'relative mb-1 data-[nav-target=true]:rounded-md data-[nav-target=true]:bg-(--color-highlight)',
  {
    variants: {
      variant: {
        h1: 'mt-[1.6em] pb-1 font-bold font-heading text-4xl',
        h2: 'mt-[1.4em] pb-px font-heading font-semibold text-2xl tracking-tight',
        h3: 'mt-[1em] pb-px font-heading font-semibold text-xl tracking-tight',
        h4: 'mt-[0.75em] font-heading font-semibold text-lg tracking-tight',
        h5: 'mt-[0.75em] font-semibold text-lg tracking-tight',
        h6: 'mt-[0.75em] font-semibold text-base tracking-tight',
      },
    },
  }
);

type HeadingVariant = NonNullable<
  VariantProps<typeof headingVariants>['variant']
>;

type HeadingElementProps = (
  | PlateElementProps<typeof H1Plugin>
  | PlateElementProps<typeof H2Plugin>
  | PlateElementProps<typeof H3Plugin>
  | PlateElementProps<typeof H4Plugin>
  | PlateElementProps<typeof H5Plugin>
  | PlateElementProps<typeof H6Plugin>
) & { variant?: HeadingVariant };

export function HeadingElement({
  variant = 'h1',
  ...props
}: HeadingElementProps) {
  return (
    <PlateElement
      as={variant}
      className={headingVariants({ variant })}
      {...props}
    >
      {props.children}
    </PlateElement>
  );
}

export function H1Element(props: PlateElementProps<typeof H1Plugin>) {
  return <HeadingElement variant="h1" {...props} />;
}

export function H2Element(props: PlateElementProps<typeof H2Plugin>) {
  return <HeadingElement variant="h2" {...props} />;
}

export function H3Element(props: PlateElementProps<typeof H3Plugin>) {
  return <HeadingElement variant="h3" {...props} />;
}

export function H4Element(props: PlateElementProps<typeof H4Plugin>) {
  return <HeadingElement variant="h4" {...props} />;
}

export function H5Element(props: PlateElementProps<typeof H5Plugin>) {
  return <HeadingElement variant="h5" {...props} />;
}

export function H6Element(props: PlateElementProps<typeof H6Plugin>) {
  return <HeadingElement variant="h6" {...props} />;
}
