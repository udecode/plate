import { type TElement, getParentNode } from '@udecode/plate-common';
import { type TReactEditor, findNodePath } from '@udecode/plate-common/react';

/** Get table column index of a cell node. */
export const getTableColumnIndex = (
  editor: TReactEditor,
  cellNode: TElement
) => {
  const path = findNodePath(editor, cellNode);

  if (!path) return -1;

  const [trNode] = getParentNode(editor, path) ?? [];

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
