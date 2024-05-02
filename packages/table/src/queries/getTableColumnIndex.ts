import { type TReactEditor, findNodePath } from '@udecode/plate-common';
import {
  type TElement,
  type Value,
  getParentNode,
} from '@udecode/plate-common/server';

/** Get table column index of a cell node. */
export const getTableColumnIndex = <V extends Value>(
  editor: TReactEditor<V>,
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
