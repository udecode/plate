import { type Element, PathApi } from '@platejs/slate';
import type { SlateEditor } from 'platejs';

import { findTableNodePath } from '../utils/findTableNodePath';

/** Get table row index of a cell node. */
export const getTableRowIndex = (editor: SlateEditor, cellNode: Element) => {
  const path = findTableNodePath(editor, cellNode);

  if (!path) return 0;

  const rowPath = PathApi.parent(path);

  return rowPath.at(-1)!;
};
