'use client';

import React from 'react';

import { withRef, withVariants } from '@udecode/cn';

import { headingVariants } from '../plate-static-ui/heading-element';
import { PlateElement } from './plate-element';

const HeadingElementVariants = withVariants(PlateElement, headingVariants, [
  'variant',
]);

export const HeadingElement = withRef<typeof HeadingElementVariants>(
  ({ children, variant = 'h1', ...props }, ref) => {
    return (
      <HeadingElementVariants
        ref={ref}
        as={variant!}
        variant={variant}
        {...props}
      >
        {children}
      </HeadingElementVariants>
    );
  }
);
