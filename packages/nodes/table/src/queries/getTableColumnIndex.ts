import {
  findNodePath,
  getParentNode,
  TElement,
  TReactEditor,
  Value,
} from '@udecode/plate-core';

/**
 * Get table column index of a cell node.
 */
export const getTableColumnIndex = <V extends Value>(
  editor: TReactEditor<V>,
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
