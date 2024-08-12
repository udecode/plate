import {
  type GetAboveNodeOptions,
  type TEditor,
  type Value,
  findNode,
  setNodes,
} from '@udecode/plate-common';

import type { TTableElement } from '../types';

import { ELEMENT_TABLE } from '../TablePlugin';
import { getTableColumnCount } from '../queries/getTableColumnCount';

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
