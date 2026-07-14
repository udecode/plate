import React from 'react';

import { cn } from './cn';

function getClassName(props: object) {
  if ('className' in props && typeof props.className === 'string') {
    return props.className;
  }
}

export type WithPropsComponent<T extends React.ElementType> =
  React.ForwardRefExoticComponent<
    React.PropsWithoutRef<React.ComponentPropsWithoutRef<T>> &
      React.RefAttributes<React.ComponentRef<T>>
  >;

/**
 * Set default props with `React.forwardRef`.
 *
 * - Use `withCn` if only setting `className`
 */
export function withProps<T extends React.ElementType>(
  Component: T,
  defaultProps:
    | Partial<React.ComponentPropsWithoutRef<T>>
    | { className?: string }
): WithPropsComponent<T> {
  return React.forwardRef<
    React.ComponentRef<T>,
    React.ComponentPropsWithoutRef<T>
  >(function ExtendComponent(props, ref) {
    const className = cn(getClassName(defaultProps), getClassName(props));
    const componentProps = {
      ...defaultProps,
      ...props,
      ...(className ? { className } : {}),
      ref,
    };

    return React.createElement(Component, componentProps);
  });
}
