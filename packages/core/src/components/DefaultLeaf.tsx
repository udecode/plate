import React from 'react';
import { RenderLeafProps } from 'slate-react';

export const DefaultLeaf = ({
  attributes,
  children,
  text,
  leaf,
  ...props
}: RenderLeafProps) => (
  <span {...attributes} {...props}>
    {children}
  </span>
);
