import {
  type Editor,
  type EditorContentProps,
  type EditorRootProps,
  EditorRoot,
  EditorContent,
} from 'platejs/react';
import React from 'react';

export type EditorTestProps<E extends Editor = Editor> = Omit<
  EditorRootProps<E>,
  'children' | 'editor'
> & {
  editableProps?: EditorContentProps;
  editor: E;
  variant?: 'comment' | 'wordProcessor';
};

export function EditorTest<E extends Editor = Editor>({
  editableProps,
  editor,
  variant = 'wordProcessor',
  ...props
}: EditorTestProps<E>) {
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
