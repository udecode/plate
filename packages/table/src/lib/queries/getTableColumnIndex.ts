import type { Editor, TElement } from '@udecode/plate';

/** Get table column index of a cell node. */
export const getTableColumnIndex = (editor: Editor, cellNode: TElement) => {
  const path = editor.api.findPath(cellNode);

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
