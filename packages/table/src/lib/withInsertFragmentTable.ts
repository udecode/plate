import {
  type OverrideEditor,
  type Path,
  type TElement,
  NodeApi,
} from '@udecode/plate';
import cloneDeep from 'lodash/cloneDeep.js';

import {
  type TableConfig,
  type TTableCellElement,
  type TTableElement,
  type TTableRowElement,
  getTableAbove,
} from '.';
import { BaseTablePlugin } from './BaseTablePlugin';
import { getTableGridAbove } from './queries/getTableGridAbove';

/**
 * If inserting a table, If block above anchor is a table,
 *
 * - Replace each cell above by the inserted table until out of bounds.
 * - Select the inserted cells.
 */
export const withInsertFragmentTable: OverrideEditor<TableConfig> = ({
  api,
  editor,
  getOptions,
  tf: { insert, insertFragment },
  type,
}) => ({
  transforms: {
    insertFragment(fragment) {
      const insertedTable = fragment.find(
        (n) => (n as TElement).type === type
      ) as TTableElement | undefined;

      if (!insertedTable) {
        const tableEntry = getTableAbove(editor, {
          at: editor.selection?.anchor,
        });

        if (tableEntry) {
          const cellEntries = getTableGridAbove(editor, {
            format: 'cell',
          });

          if (cellEntries.length > 1) {
            cellEntries.forEach((cellEntry) => {
              if (cellEntry) {
                const [, cellPath] = cellEntry;

                editor.tf.replaceNodes(cloneDeep(fragment) as any, {
                  at: cellPath,
                  children: true,
                });
              }
            });

            editor.tf.select({
              anchor: editor.api.start(cellEntries[0][1])!,
              focus: editor.api.end(cellEntries.at(-1)![1])!,
            });

            return;
          }
        }
      }
      if (insertedTable) {
        const tableEntry = getTableAbove(editor, {
          at: editor.selection?.anchor,
        });

        // inserting inside table
        if (tableEntry) {
          const [cellEntry] = getTableGridAbove(editor, {
            at: editor.selection?.anchor,
            format: 'cell',
          });

          if (cellEntry) {
            editor.tf.withoutNormalizing(() => {
              const [, startCellPath] = cellEntry;
              const cellPath = [...startCellPath];

              const startColIndex = cellPath.at(-1)!;
              let lastCellPath: Path | null = null;

              let initRow = true;
              const insertedRows = insertedTable.children as TTableRowElement[];
              insertedRows.forEach((row) => {
                cellPath[cellPath.length - 1] = startColIndex;

                // last inserted row
                if (!initRow) {
                  const fromRow = cellPath.slice(0, -1);
                  cellPath[cellPath.length - 2] += 1;

                  if (!NodeApi.has(editor, cellPath)) {
                    if (getOptions().disableExpandOnInsert) {
                      return;
                    } else {
                      insert.tableRow({
                        fromRow,
                      });
                    }
                  }
                }

                initRow = false;

                const insertedCells = row.children as TTableCellElement[];
                let initCell = true;

                insertedCells.forEach((cell) => {
                  if (!initCell) {
                    const fromCell = [...cellPath];
                    cellPath[cellPath.length - 1] += 1;

                    if (!NodeApi.has(editor, cellPath)) {
                      if (getOptions().disableExpandOnInsert) {
                        return;
                      } else {
                        insert.tableColumn({
                          fromCell,
                        });
                      }
                    }
                  }

                  initCell = false;

                  const cellChildren = api.table.getCellChildren!(
                    cell
                  ) as TTableCellElement[];

                  editor.tf.replaceNodes(cloneDeep(cellChildren as any), {
                    at: cellPath,
                    children: true,
                  });

                  lastCellPath = [...cellPath];
                });
              });

              if (lastCellPath) {
                editor.tf.select({
                  anchor: editor.api.start(startCellPath)!,
                  focus: editor.api.end(lastCellPath)!,
                });
              }
            });

            return;
          }
        } else if (
          fragment.length === 1 &&
          fragment[0].type === BaseTablePlugin.key
        ) {
          // needed to insert as node, otherwise it will be inserted as text
          editor.tf.insertNodes(fragment[0]);

          return;
        }
      }

      insertFragment(fragment);
    },
  },
});
