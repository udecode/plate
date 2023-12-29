import React from 'react';

import { cn } from './cn';

/**
 * Set default props with `React.forwardRef`.
 * - Use `withCn` if only setting `className`
 */
export function withProps<
  T extends keyof HTMLElementTagNameMap | React.ComponentType<any>,
>(Component: T, defaultProps: Partial<React.ComponentPropsWithoutRef<T>>) {
  const ComponentWithClassName = Component as React.FC<{ className: string }>;

  return React.forwardRef<
    React.ElementRef<T>,
    React.ComponentPropsWithoutRef<T>
  >(function ExtendComponent(props, ref) {
    return (
      <ComponentWithClassName
        ref={ref}
        {...defaultProps}
        {...props}
        className={cn(
          (defaultProps as any).className,
          (props as any).className
        )}
      />
    );
  });
}
