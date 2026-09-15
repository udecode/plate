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
      className="my-1 border-l-2 pl-6 italic"
      {...props}
    />
  );
}
