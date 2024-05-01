import React from 'react';
import { Value } from '@udecode/slate';

import { PlateRenderLeafProps } from '../types/PlateRenderLeafProps';

export function DefaultLeaf<V extends Value>({
  attributes,
  children,
  text,
  leaf,
  editor,
  nodeProps,
  ...props
}: PlateRenderLeafProps<V>) {
  return (
    <span {...attributes} {...props}>
      {children}
    </span>
  );
}
