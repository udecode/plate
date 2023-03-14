import {
  findNode,
  focusEditor,
  getRange,
  select,
  TReactEditor,
  Value,
} from '@udecode/plate-common';

/**
 * Select the block above the selection by id and focus the editor.
 */
export const selectBlockById = <V extends Value>(
  editor: TReactEditor<V>,
  id: string
) => {
  const path = findNode(editor, { at: [], match: { id } })?.[1];
  if (!path) return;

  select(editor, getRange(editor, path));
  focusEditor(editor);
};
