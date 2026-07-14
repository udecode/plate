import type { BaseEditor } from '@platejs/core';
import type { TTableElement } from '@platejs/utils';

import { KEYS } from '@platejs/utils';

import { getTableColumnCount } from '../queries/getTableColumnCount';
import type { TableFindOptions } from '../types';

export const setTableColSize = (
  editor: BaseEditor,
  { colIndex, width }: { colIndex: number; width: number },
  options: TableFindOptions = {}
) => {
  const table = editor.read.nodes.find<TTableElement>({
    match: { type: editor.getType(KEYS.table) },
    ...options,
  });

  if (!table) return;

  const [tableNode, tablePath] = table;

  const colSizes = tableNode.colSizes
    ? [...tableNode.colSizes]
    : Array.from({ length: getTableColumnCount(tableNode) }).fill(0);

  colSizes[colIndex] = width;

  editor.update.nodes.set<TTableElement>({ colSizes }, { at: tablePath });
};
