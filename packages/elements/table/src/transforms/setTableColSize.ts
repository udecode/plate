import {
  EditorAboveOptions,
  findNode,
  setNodes,
  TEditor,
  TElement,
} from '@udecode/plate-core';
import { ELEMENT_TABLE } from '../createTablePlugin';
import { getTableColumnCount } from '../queries/getTableColumnCount';
import { TableNodeData } from '../types';

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
