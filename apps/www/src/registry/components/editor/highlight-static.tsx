import type { BaseHighlightPlugin } from 'platejs';
import { type EditorLeafProps, EditorLeaf } from 'platejs/static';
import * as React from 'react';

export function HighlightLeafStatic(
  props: EditorLeafProps<typeof BaseHighlightPlugin>
) {
  return (
    <EditorLeaf {...props} as="mark" className="bg-highlight/30 text-inherit">
      {props.children}
    </EditorLeaf>
  );
}
