import type { BaseCodePlugin } from 'platejs';
import { type EditorLeafProps, EditorLeaf } from 'platejs/static';
import * as React from 'react';

export function CodeLeafStatic(props: EditorLeafProps<typeof BaseCodePlugin>) {
  return (
    <EditorLeaf
      {...props}
      as="code"
      className="rounded-md bg-muted px-[0.3em] py-[0.2em] font-mono text-sm whitespace-pre-wrap"
    >
      {props.children}
    </EditorLeaf>
  );
}
