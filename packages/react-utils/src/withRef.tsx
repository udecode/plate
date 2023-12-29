import React from 'react';

/**
 * Shorter alternative to `React.forwardRef`.
 * @generic1 Component type or element type
 * @generic2 Extended prop types
 */
export function withRef<
  T extends keyof HTMLElementTagNameMap | React.ComponentType<any>,
  E = {},
>(
  renderFunction: React.ForwardRefRenderFunction<
    React.ElementRef<T>,
    React.ComponentPropsWithoutRef<T> & E
  >
) {
  return React.forwardRef(renderFunction);
}
