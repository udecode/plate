import { ElementApi, type Editor, type Element } from '@platejs/plite';

/** Get table column index of a cell node. */
export const getTableColumnIndex = (editor: Editor, cellNode: Element) => {
  const path = editor.read.nodes.path(cellNode);

  if (!path) return -1;

  const [trNode] = editor.read.nodes.parent(path) ?? [];

  if (!trNode || !ElementApi.isElement(trNode)) return -1;

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
