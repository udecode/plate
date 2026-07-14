import type { BaseEditor } from '@platejs/core';
import type {
  EditorUpdateTransaction,
  NodeInsertNodesOptions,
} from '@platejs/plite';
import { type TTableElement, KEYS } from '@platejs/utils';
import { PathApi } from '@platejs/plite';

import type { GetEmptyTableNodeOptions } from '../api/getEmptyTableNode';
import type { TableConfig } from '../BaseTablePlugin';

/**
 * Insert table. If selection in table and no 'at' specified, insert after
 * current table. Select start of new table.
 */
export const insertTable = (
  editor: BaseEditor,
  tx: EditorUpdateTransaction,
  { colCount = 2, header, rowCount = 2 }: GetEmptyTableNodeOptions = {},
  options: NodeInsertNodesOptions<TTableElement> = {}
) => {
  const { api } = editor.getPlugin<TableConfig>({ key: KEYS.table });
  const type = editor.getType(KEYS.table);
  const newTable = api.table.createTable({ colCount, header, rowCount });
  const insertOptions = { ...options, select: false };
  const selectTableStart = (tablePath: number[] | undefined) => {
    if (!options.select) return;

    const point = tablePath ? tx.points.start(tablePath) : undefined;

    if (point) tx.selection.set({ anchor: point, focus: point });
  };

  if (options.at !== undefined) {
    const tablePath = PathApi.isPath(options.at)
      ? options.at
      : tx.nodes.path(options.at);

    tx.nodes.insert(newTable, insertOptions);
    selectTableStart(tablePath);
    return;
  }

  const currentTable = editor.read.nodes.above<TTableElement>({
    match: { type },
  });

  if (currentTable) {
    const tablePath = PathApi.next(currentTable[1]);

    tx.nodes.insert(newTable, {
      ...insertOptions,
      at: tablePath,
    });
    selectTableStart(tablePath);
    return;
  }

  const currentBlock = editor.read.nodes.block();
  const tablePath = currentBlock
    ? PathApi.next(currentBlock[1])
    : [editor.read.children().length];

  tx.blocks.insertAfter(newTable, insertOptions);
  selectTableStart(tablePath);
};
