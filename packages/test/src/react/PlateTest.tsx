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
  editableProps?: EditorContentProps & {
    [name: `data-${string}`]: boolean | number | string | undefined;
  };
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
      <EditorContent data-variant={variant} autoFocus {...editableProps} />
    </EditorRoot>
  );
}
