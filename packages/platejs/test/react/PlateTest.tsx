import React from 'react';

import {
  type Editor,
  type EditorContentProps,
  type EditorRootProps,
  EditorRoot,
  EditorContent,
} from '../../src/react';
import type { EditorReference } from '../../src/react/editor/Editor';

export function EditorTest<E extends EditorReference = Editor>({
  editableProps,
  editor,
  variant = 'wordProcessor',
  ...props
}: Omit<EditorRootProps<E>, 'children' | 'editor'> & {
  editableProps?: EditorContentProps;
  editor: E;
  variant?: 'comment' | 'wordProcessor';
}) {
  return (
    <EditorRoot {...props} editor={editor}>
      <EditorContent
        data-testid="plite-content-editable"
        data-variant={variant}
        autoFocus
        {...editableProps}
      />
    </EditorRoot>
  );
}
