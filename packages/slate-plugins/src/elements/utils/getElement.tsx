import React from 'react';
import { RenderElementProps } from 'slate-react';

/**
 * get default element component
 */
export const getElement = (Component: any) => ({
  attributes,
  element,
  children,
}: RenderElementProps) => (
  <Component {...attributes} data-slate-type={element.type}>
    {children}
  </Component>
);
