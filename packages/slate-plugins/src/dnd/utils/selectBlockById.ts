import { Editor, Transforms } from 'slate';
import { ReactEditor } from 'slate-react';
import { getBlockPathById } from './getBlockPathById';

/**
 * Select the block above the selection by id and focus the editor.
 */
export const selectBlockById = (editor: ReactEditor, id: string) => {
  const path = getBlockPathById(editor, id);
  if (!path) return;

  Transforms.select(editor, Editor.range(editor, path));
  ReactEditor.focus(editor);
};
