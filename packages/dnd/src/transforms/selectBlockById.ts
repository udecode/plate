import { findNode, getRange, select } from '@udecode/plate-common';
import { type TReactEditor, focusEditor } from '@udecode/plate-common/react';

/** Select the block above the selection by id and focus the editor. */
export const selectBlockById = (editor: TReactEditor, id: string) => {
  const path = findNode(editor, { at: [], match: { id } })?.[1];

  if (!path) return;

  select(editor, getRange(editor, path));
  focusEditor(editor);
};
