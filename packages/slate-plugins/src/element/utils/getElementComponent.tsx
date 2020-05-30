import * as React from 'react';
import { RenderElementProps } from 'slate-react';

/**
 * Get default element component
 */
export const getElementComponent = (Component: any) => ({
  attributes,
  element,
  children,
  ...props
}: RenderElementProps) => (
  <Component data-slate-type={element.type} {...attributes} {...props}>
    {children}
  </Component>
);
