import React from 'react';

import type { Value } from '@udecode/slate';

import type { PlateRenderLeafProps } from '../types/PlateRenderLeafProps';

export function DefaultLeaf<V extends Value>({
  attributes,
  children,
  editor,
  leaf,
  nodeProps,
  text,
  ...props
}: PlateRenderLeafProps<V>) {
  return (
    <span {...attributes} {...props}>
      {children}
    </span>
  );
}
