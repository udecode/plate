import { type EditorUpdateTransaction, PathApi } from '@platejs/plite';
import { type BasePlateEditor, KEYS } from 'platejs';

import type { GetEmptyTableNodeOptions } from '../api/getEmptyTableNode';
import type { TableConfig } from '../BaseTablePlugin';

type InsertTableOptions = NonNullable<
  Parameters<EditorUpdateTransaction['nodes']['insert']>[1]
>;

/**
 * Insert table. If selection in table and no 'at' specified, insert after
 * current table. Select start of new table.
 */
export const insertTable = (
  editor: BasePlateEditor,
  { colCount = 2, header, rowCount = 2 }: GetEmptyTableNodeOptions = {},
  { select: shouldSelect, ...options }: InsertTableOptions = {}
) => {
  const { api } = editor.getPlugin<TableConfig>({ key: KEYS.table });
  const type = editor.getType(KEYS.table);

  editor.update((tx) => {
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

        tx.nodes.insert(newTable, {
          at: insertPath,
          ...options,
        });

        if (editor.selection) {
          tx.selection.set(editor.api.start(insertPath)!);
        }

        return;
      }
    }

    const insertOptions = { ...options };

    if (!insertOptions.at) {
      const blockEntry = editor.api.block();

      if (blockEntry) {
        insertOptions.at = PathApi.next(blockEntry[1]);
      }
    }

    // Use specified path, the next block path, or the current selection.
    tx.nodes.insert(newTable, {
      select: shouldSelect,
      ...insertOptions,
    });

    if (shouldSelect) {
      const tableEntry = editor.api.node({
        at: options.at,
        match: { type },
      });

      if (!tableEntry) return;

      tx.selection.set(editor.api.start(tableEntry[1])!);
    }
  });
};
