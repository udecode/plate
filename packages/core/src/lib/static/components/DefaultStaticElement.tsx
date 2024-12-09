import React from 'react';

import type { RenderElementProps } from 'slate-react/dist/components/editable';

export function DefaultStaticElement({
  attributes,
  children,
}: RenderElementProps) {
  return <div {...attributes}>{children}</div>;
}
