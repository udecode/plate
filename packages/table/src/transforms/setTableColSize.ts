import {
  type GetAboveNodeOptions,
  type TEditor,
  findNode,
  setNodes,
} from '@udecode/plate-common';

import type { TTableElement } from '../types';

import { TablePlugin } from '../TablePlugin';
import { getTableColumnCount } from '../queries/getTableColumnCount';

export const setTableColSize = <E extends TEditor>(
  editor: E,
  { colIndex, width }: { colIndex: number; width: number },
  options: GetAboveNodeOptions<E> = {}
) => {
  const table = findNode<TTableElement>(editor, {
    match: { type: TablePlugin.key },
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
