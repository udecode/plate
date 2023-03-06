import React from 'react';
import { Value } from '@udecode/slate';
import { PlateRenderLeafProps } from '../../types/plate/PlateRenderLeafProps';

export const DefaultLeaf = <V extends Value>({
  attributes,
  children,
  text,
  leaf,
  editor,
  nodeProps,
  ...props
}: PlateRenderLeafProps<V>) => (
  <span {...attributes} {...props}>
    {children}
  </span>
);
