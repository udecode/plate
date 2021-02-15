import { findNode } from '@udecode/slate-plugins-common';
import { Editor, Transforms } from 'slate';
import { ReactEditor } from 'slate-react';

/**
 * Select the start of a block by id and focus the editor.
 */
export const focusBlockStartById = (editor: ReactEditor, id: string) => {
  const path = findNode(editor, { match: { id } })?.[1];
  if (!path) return;

  Transforms.select(editor, Editor.start(editor, path));
  ReactEditor.focus(editor);
};
