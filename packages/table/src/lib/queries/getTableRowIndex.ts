import { type Editor, type TElement, PathApi } from '@udecode/plate';

/** Get table row index of a cell node. */
export const getTableRowIndex = (editor: Editor, cellNode: TElement) => {
  const path = editor.api.findPath(cellNode);

  if (!path) return 0;

  const rowPath = PathApi.parent(path);

  return rowPath.at(-1)!;
};
