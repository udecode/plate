import React from 'react';
import { RenderElementProps } from 'slate-react';

/**
 * get default element component
 */
export const getElement = (Component: any) => ({
  attributes,
  children,
}: RenderElementProps) => <Component {...attributes}>{children}</Component>;
