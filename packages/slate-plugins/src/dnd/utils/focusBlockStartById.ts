import { Editor, Transforms } from 'slate';
import { ReactEditor } from 'slate-react';
import { getBlockPathById } from './getBlockPathById';

/**
 * Select the start of a block by id and focus the editor.
 */
export const focusBlockStartById = (editor: ReactEditor, id: string) => {
  const path = getBlockPathById(editor, id);
  if (!path) return;

  Transforms.select(editor, Editor.start(editor, path));
  ReactEditor.focus(editor);
};
