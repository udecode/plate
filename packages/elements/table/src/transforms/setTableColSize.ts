import { EditorAboveOptions, findNode, setNodes } from '@udecode/plate-common';
import { TEditor, TElement } from '@udecode/plate-core';
import { ELEMENT_TABLE, TableNodeData } from '@udecode/plate-table';
import { getTableColumnCount } from '../queries/getTableColumnCount';

export const setTableColSize = (
  editor: TEditor,
  { colIndex, width }: { colIndex: number; width: number },
  options: EditorAboveOptions = {}
) => {
  const table = findNode<TElement<TableNodeData>>(editor, {
    ...options,
    match: { type: ELEMENT_TABLE },
  });
  if (!table) return;

  const [tableNode, tablePath] = table;

  const colSizes = tableNode.colSizes
    ? [...tableNode.colSizes]
    : Array(getTableColumnCount(tableNode)).fill(0);

  colSizes[colIndex] = width;

  setNodes(editor, { colSizes }, { at: tablePath });
};
