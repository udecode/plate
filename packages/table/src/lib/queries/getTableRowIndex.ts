import { type Editor, type Element, PathApi } from '@platejs/plite';

/** Get table row index of a cell node. */
export const getTableRowIndex = (editor: Editor, cellNode: Element) => {
  const path = editor.read.nodes.path(cellNode);

  if (!path) return 0;

  const rowPath = PathApi.parent(path);

  return rowPath.at(-1)!;
};
