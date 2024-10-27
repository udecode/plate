import React from 'react';

import type { PlateRenderLeafProps } from '../plugin/PlateRenderLeafProps';

export function DefaultLeaf({
  attributes,
  children,
  style,
}: PlateRenderLeafProps & { style?: React.CSSProperties }) {
  return (
    <span {...attributes} style={style}>
      {children}
    </span>
  );
}
