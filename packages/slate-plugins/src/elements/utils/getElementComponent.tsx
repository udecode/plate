import React from 'react';
import { RenderElementProps } from 'slate-react';

/**
 * Get default element component
 */
export const getElementComponent = (Component: any) => ({
  attributes,
  element,
  children,
}: RenderElementProps) => (
  <Component data-slate-type={element.type} {...attributes}>
    {children}
  </Component>
);
