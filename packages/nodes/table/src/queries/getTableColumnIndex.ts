import { findNodePath, getParentNode, TElement } from '@udecode/plate-core';
import { ReactEditor } from 'slate-react';

/**
 * Get table column index of a cell node.
 */
export const getTableColumnIndex = (
  editor: ReactEditor,
  { node }: { node: TElement }
) => {
  const path = findNodePath(editor, node);
  if (!path) return 0;

  const [trNode] = getParentNode(editor, path) ?? [];
  if (!trNode) return 0;

  let colIndex = 0;

  trNode.children.some((item, index) => {
    if (item === node) {
      colIndex = index;
      return true;
    }
    return false;
  });

  return colIndex;
};
