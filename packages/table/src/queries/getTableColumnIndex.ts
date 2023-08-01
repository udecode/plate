import {
  findNodePath,
  getParentNode,
  TElement,
  TReactEditor,
  Value,
} from '@udecode/plate-common';

/**
 * Get table column index of a cell node.
 */
export const getTableColumnIndex = <V extends Value>(
  editor: TReactEditor<V>,
  cellNode: TElement
) => {
  const path = findNodePath(editor, cellNode);
  if (!path) return 0;

  const [trNode] = getParentNode(editor, path) ?? [];
  if (!trNode) return 0;

  let colIndex = 0;

  trNode.children.some((item, index) => {
    if (item === cellNode) {
      colIndex = index;
      return true;
    }
    return false;
  });

  return colIndex;
};
