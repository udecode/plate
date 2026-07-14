import type { CxOptions } from 'class-variance-authority';
import type React from 'react';

import { cn } from './cn';
import { withProps } from './withProps';

/**
 * Set default `className` with `cn`.
 */
export function withCn<T extends React.ElementType>(
  Component: 'className' extends keyof React.ComponentPropsWithoutRef<T>
    ? T
    : never,
  ...inputs: CxOptions
) {
  return withProps<T>(Component, { className: cn(inputs) });
}
