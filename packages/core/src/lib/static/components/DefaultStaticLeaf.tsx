import React from 'react';

import type { RenderLeafProps } from 'slate-react/dist/components/editable';

export function DefaultStaticLeaf({ attributes, children }: RenderLeafProps) {
  return <span {...attributes}>{children}</span>;
}
