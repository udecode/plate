import {
  type TEditor,
  type TElement,
  getParentNode,
} from '@udecode/plate-common';
import { findPath } from '@udecode/plate-common/react';

/** Get table column index of a cell node. */
export const getTableColumnIndex = (editor: TEditor, cellNode: TElement) => {
  const path = findPath(editor, cellNode);

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
