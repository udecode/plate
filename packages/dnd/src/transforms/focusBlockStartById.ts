import {
  findNode,
  focusEditor,
  getStartPoint,
  select,
  TReactEditor,
  Value,
} from '@udecode/plate-core';

/**
 * Select the start of a block by id and focus the editor.
 */
export const focusBlockStartById = <V extends Value>(
  editor: TReactEditor<V>,
  id: string
) => {
  const path = findNode(editor, { at: [], match: { id } })?.[1];
  if (!path) return;

  select(editor, getStartPoint(editor, path));
  focusEditor(editor);
};
