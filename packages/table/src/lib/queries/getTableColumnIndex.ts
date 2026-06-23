import type { Element } from '@platejs/plite';
import type { BasePlateEditor } from 'platejs';

import { findTableNodePath } from '../utils/findTableNodePath';

/** Get table column index of a cell node. */
export const getTableColumnIndex = (
  editor: BasePlateEditor,
  cellNode: Element
) => {
  const path = findTableNodePath(editor, cellNode);

  if (!path) return -1;

  const [trNode] = editor.api.parent(path) ?? [];

  if (!trNode) return -1;

  let colIndex = -1;

  trNode.children.some((item, index) => {
    if (item === cellNode) {
      colIndex = index;

      return true;
    }

    return false;
  });

  return colIndex;
};
