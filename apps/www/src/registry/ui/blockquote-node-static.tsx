import * as React from 'react';

import type { BaseBlockquotePlugin } from '@platejs/basic-nodes';
import { type PliteElementProps, PliteElement } from 'platejs/static';

export function BlockquoteElementStatic(
  props: PliteElementProps<typeof BaseBlockquotePlugin>
) {
  return (
    <PliteElement
      as="blockquote"
      className="my-1 border-l-2 pl-6 italic"
      {...props}
    />
  );
}
