import { type TReactEditor, focusEditor } from '@udecode/plate-common';
import {
  type Value,
  findNode,
  getRange,
  select,
} from '@udecode/plate-common/server';

/** Select the block above the selection by id and focus the editor. */
export const selectBlockById = <V extends Value>(
  editor: TReactEditor<V>,
  id: string
) => {
  const path = findNode(editor, { at: [], match: { id } })?.[1];

  if (!path) return;

  select(editor, getRange(editor, path));
  focusEditor(editor);
};
