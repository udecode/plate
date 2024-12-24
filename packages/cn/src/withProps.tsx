import React from 'react';

import { cn } from './cn';

/**
 * Set default props with `React.forwardRef`.
 *
 * - Use `withCn` if only setting `className`
 */
export function withProps<
  T extends React.ComponentType<Record<string, unknown>>,
  P extends
    React.ComponentPropsWithoutRef<T> = React.ComponentPropsWithoutRef<T>,
>(component: T, defaultProps: P) {
  const ComponentWithClassName = component as React.FC<
    P & { className: string }
  >;

  return React.forwardRef<
    React.ComponentRef<React.ComponentType<T>>,
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
