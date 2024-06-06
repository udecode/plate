import React from 'react';

/**
 * Shorter alternative to `React.forwardRef`.
 *
 * @generic1 Component type or element type
 * @generic2 Extended prop types
 */
export function withRef<
  T extends React.ComponentType<any> | keyof HTMLElementTagNameMap,
  E = {},
>(
  renderFunction: React.ForwardRefRenderFunction<
    React.ElementRef<T>,
    E & Omit<React.ComponentPropsWithoutRef<T>, keyof E>
  >
) {
  return React.forwardRef(renderFunction);
}
