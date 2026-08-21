'use client';

import type { HeadingPlugin } from '@platejs/basic-nodes/react';
import { cva } from 'class-variance-authority';
import type { PlateElementProps } from 'platejs/react';
import { PlateElement } from 'platejs/react';
import * as React from 'react';

const headingVariants = cva(
  'relative mb-1 data-[nav-target=true]:rounded-md data-[nav-target=true]:bg-(--color-highlight)',
  {
    variants: {
      level: {
        1: 'mt-[1.6em] pb-1 font-bold font-heading text-4xl',
        2: 'mt-[1.4em] pb-px font-heading font-semibold text-2xl tracking-tight',
        3: 'mt-[1em] pb-px font-heading font-semibold text-xl tracking-tight',
        4: 'mt-[0.75em] font-heading font-semibold text-lg tracking-tight',
        5: 'mt-[0.75em] font-semibold text-lg tracking-tight',
        6: 'mt-[0.75em] font-semibold text-base tracking-tight',
      },
    },
  }
);

export function HeadingElement(props: PlateElementProps<typeof HeadingPlugin>) {
  const level = props.element.level;
  const tag = `h${level}` as const;

  return (
    <PlateElement as={tag} className={headingVariants({ level })} {...props}>
      {props.children}
    </PlateElement>
  );
}
