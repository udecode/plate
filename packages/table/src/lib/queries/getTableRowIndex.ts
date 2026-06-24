import { type Element, PathApi } from '@platejs/plite';
import type { BasePlateEditor } from 'platejs';

import { findTableNodePath } from '../utils/findTableNodePath';

/** Get table row index of a cell node. */
export const getTableRowIndex = (
  editor: BasePlateEditor,
  cellNode: Element
) => {
  const path = findTableNodePath(editor, cellNode);

  if (!path) return 0;

  const rowPath = PathApi.parent(path);

  return rowPath.at(-1)!;
};
