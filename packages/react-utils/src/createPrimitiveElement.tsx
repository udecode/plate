import React from 'react';

export function createPrimitiveElement<T extends keyof HTMLElementTagNameMap>(
  tag: T
) {
  return React.forwardRef<HTMLElementTagNameMap[T], JSX.IntrinsicElements[T]>(
    function CreateComponent(props, ref) {
      return React.createElement(tag, { ...props, ref });
    }
  );
}
