import type { CxOptions } from 'class-variance-authority';
import type React from 'react';

import { cn } from './cn';
import { withProps } from './withProps';

/**
 * Set default `className` with `cn`.
 */
export function withCn<T extends React.ComponentType<any>>(
  Component: T,
  ...inputs: CxOptions
) {
  return withProps(Component, { className: cn(inputs) } as any);
}
