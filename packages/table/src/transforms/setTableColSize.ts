import {
  GetAboveNodeOptions,
  TEditor,
  Value,
  findNode,
  setNodes,
} from '@udecode/plate-common';

import { ELEMENT_TABLE } from '../createTablePlugin';
import { getTableColumnCount } from '../queries/getTableColumnCount';
import { TTableElement } from '../types';

export const setTableColSize = <V extends Value>(
  editor: TEditor<V>,
  { colIndex, width }: { colIndex: number; width: number },
  options: GetAboveNodeOptions<V> = {}
) => {
  const table = findNode<TTableElement>(editor, {
    match: { type: ELEMENT_TABLE },
    ...options,
  });
  if (!table) return;

  const [tableNode, tablePath] = table;

  const colSizes = tableNode.colSizes
    ? [...tableNode.colSizes]
    : Array.from({ length: getTableColumnCount(tableNode) }).fill(0);

  colSizes[colIndex] = width;

  setNodes<TTableElement>(editor, { colSizes }, { at: tablePath });
};
