import React from 'react';
import { TRenderLeafProps } from '../types/TRenderLeafProps';

export const DefaultLeaf = ({
  attributes,
  children,
  text,
  leaf,
  ...props
}: TRenderLeafProps) => (
  <span {...attributes} {...props}>
    {children}
  </span>
);
