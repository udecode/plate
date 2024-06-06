import { type TReactEditor, focusEditor } from '@udecode/plate-common';
import {
  type Value,
  findNode,
  getStartPoint,
  select,
} from '@udecode/plate-common/server';

/** Select the start of a block by id and focus the editor. */
export const focusBlockStartById = <V extends Value>(
  editor: TReactEditor<V>,
  id: string
) => {
  const path = findNode(editor, { at: [], match: { id } })?.[1];

  if (!path) return;

  select(editor, getStartPoint(editor, path));
  focusEditor(editor);
};
