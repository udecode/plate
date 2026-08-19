'use client';

import type { BlockquotePlugin } from '@platejs/basic-nodes/react';
import { type PlateElementProps, PlateElement } from 'platejs/react';

export function BlockquoteElement(
  props: PlateElementProps<typeof BlockquotePlugin>
) {
  return (
    <PlateElement
      as="blockquote"
      className="my-1 border-l-2 pl-6 italic"
      {...props}
    />
  );
}
