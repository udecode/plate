import {
  type InsertNodesOptions,
  type SlateEditor,
  type TTableElement,
  KEYS,
  PathApi,
} from 'platejs';

import type { GetEmptyTableNodeOptions } from '../api/getEmptyTableNode';
import type { TableConfig } from '../BaseTablePlugin';

/**
 * Insert table. If selection in table and no 'at' specified, insert after
 * current table. Select start of new table.
 */
export const insertTable = (
  editor: SlateEditor,
  { colCount = 2, header, rowCount = 2 }: GetEmptyTableNodeOptions = {},
  { select: shouldSelect, ...options }: InsertNodesOptions = {}
) => {
  const { api } = editor.getPlugin<TableConfig>({ key: KEYS.table });
  const type = editor.getType(KEYS.table);

  editor.tf.withoutNormalizing(() => {
    const newTable = api.create.table({
      colCount,
      header,
      rowCount,
    });

    if (!options.at) {
      const currentTableEntry = editor.api.block({
        match: { type },
      });

      if (currentTableEntry) {
        // Insert after current table
        const [, tablePath] = currentTableEntry;
        const insertPath = PathApi.next(tablePath);

        editor.tf.insertNodes<TTableElement>(newTable, {
          at: insertPath,
          ...(options as any),
        });

        if (editor.selection) {
          editor.tf.select(editor.api.start(insertPath)!);
        }

        return;
      }
    }

    // Use specified path or insert at current selection
    editor.tf.insertNodes<TTableElement>(newTable, {
      nextBlock: !options.at,
      select: shouldSelect,
      ...(options as any),
    });

    if (shouldSelect) {
      const tableEntry = editor.api.node({
        at: options.at,
        match: { type },
      });

      if (!tableEntry) return;

      editor.tf.select(editor.api.start(tableEntry[1])!);
    }
  });
};
