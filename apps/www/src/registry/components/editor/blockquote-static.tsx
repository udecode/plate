import type { BaseBlockquotePlugin } from 'platejs';
import { type EditorElementProps, EditorElement } from 'platejs/static';
import * as React from 'react';

export function BlockquoteElementStatic(
  props: EditorElementProps<typeof BaseBlockquotePlugin>
) {
  return (
    <EditorElement
      as="blockquote"
      className="my-1 border-l-2 pl-6 italic"
      {...props}
    />
  );
}
