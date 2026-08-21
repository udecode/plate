import type { BaseBlockquotePlugin } from '@platejs/basic-nodes';
import { type PliteElementProps, PliteElement } from 'platejs/static';
import * as React from 'react';

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
