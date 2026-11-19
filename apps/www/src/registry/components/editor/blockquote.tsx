'use client';

import {
  type BlockquotePlugin,
  type EditorElementProps,
  EditorElement,
} from 'platejs/react';

export function BlockquoteElement(
  props: EditorElementProps<typeof BlockquotePlugin>
) {
  return (
    <EditorElement
      as="blockquote"
      className="my-1 border-s-2 ps-6 italic"
      {...props}
    />
  );
}
