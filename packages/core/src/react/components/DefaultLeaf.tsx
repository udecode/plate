import React from 'react';

import type { PlateRenderLeafProps } from '../plugin/PlateRenderLeafProps';

export function DefaultLeaf({ attributes, children }: PlateRenderLeafProps) {
  return <span {...attributes}>{children}</span>;
}
