import {
  findNodePath,
  TElement,
  TReactEditor,
  Value,
} from '@udecode/plate-common';
import { Path } from 'slate';

/**
 * Get table row index of a cell node.
 */
export const getTableRowIndex = <V extends Value>(
  editor: TReactEditor<V>,
  cellNode: TElement
) => {
  const path = findNodePath(editor, cellNode);
  if (!path) return 0;
  const rowPath = Path.parent(path);
  return rowPath[rowPath.length - 1];
};
