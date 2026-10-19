'use client';

import {
  type HighlightPlugin,
  type EditorLeafProps,
  EditorLeaf,
} from 'platejs/react';
import * as React from 'react';

export function HighlightLeaf(props: EditorLeafProps<typeof HighlightPlugin>) {
  return (
    <EditorLeaf {...props} as="mark" className="bg-highlight/30 text-inherit">
      {props.children}
    </EditorLeaf>
  );
}
