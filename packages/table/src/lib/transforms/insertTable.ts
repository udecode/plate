import {
  type InsertNodesOptions,
  type SlateEditor,
  getBlockAbove,
  getStartPoint,
  insertNodes,
  select,
  withoutNormalizing,
} from '@udecode/plate-common';
import { Path } from 'slate';

import type { TTableElement } from '../types';
import type { GetEmptyTableNodeOptions } from '../api/getEmptyTableNode';

import { type TableConfig, BaseTablePlugin } from '../BaseTablePlugin';

/**
 * Insert table. If selection in table and no 'at' specified, insert after
 * current table. Select start of new table.
 */
export const insertTable = <E extends SlateEditor>(
  editor: E,
  { colCount = 2, header, rowCount = 2 }: GetEmptyTableNodeOptions = {},
  options: InsertNodesOptions<E> = {}
) => {
  const { api } = editor.getPlugin<TableConfig>({ key: 'table' });
  const type = editor.getType(BaseTablePlugin);

  withoutNormalizing(editor, () => {
    const newTable = api.create.table({
      colCount,
      header,
      rowCount,
    });

    if (!options.at) {
      const currentTableEntry = getBlockAbove(editor, {
        match: { type },
      });

      if (currentTableEntry) {
        // Insert after current table
        const [, tablePath] = currentTableEntry;
        const insertPath = Path.next(tablePath);

        insertNodes<TTableElement>(editor, newTable, {
          at: insertPath,
          ...(options as any),
        });

        if (editor.selection) {
          select(editor, getStartPoint(editor, insertPath));
        }

        return;
      }
    }

    // Use specified path or insert at current selection
    insertNodes<TTableElement>(editor, newTable, {
      nextBlock: true,
      ...(options as any),
    });

    if (editor.selection) {
      const tableEntry = getBlockAbove(editor, {
        match: { type },
      });

      if (!tableEntry) return;

      select(editor, getStartPoint(editor, tableEntry[1]));
    }
  });
};
