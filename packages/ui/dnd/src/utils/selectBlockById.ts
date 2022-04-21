import { findNode, TReactEditor } from '@udecode/plate-core';
import { Editor, Transforms } from 'slate';
import { ReactEditor } from 'slate-react';

/**
 * Select the block above the selection by id and focus the editor.
 */
export const selectBlockById = (editor: TReactEditor, id: string) => {
  const path = findNode(editor, { at: [], match: { id } })?.[1];
  if (!path) return;

  Transforms.select(editor, Editor.range(editor, path));
  ReactEditor.focus(editor);
};
