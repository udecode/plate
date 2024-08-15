import type { Path } from 'slate';

import {
  type TElement,
  type WithOverride,
  getEndPoint,
  getStartPoint,
  hasNode,
  replaceNodeChildren,
  select,
  withoutNormalizing,
} from '@udecode/plate-common';
import cloneDeep from 'lodash/cloneDeep.js';

import type {
  TTableCellElement,
  TTableElement,
  TTableRowElement,
  TableConfig,
} from './types';

import { TablePlugin } from './TablePlugin';
import { getTableAbove } from './queries/getTableAbove';
import { getTableGridAbove } from './queries/getTableGridAbove';

/**
 * If inserting a table, If block above anchor is a table,
 *
 * - Replace each cell above by the inserted table until out of bounds.
 * - Select the inserted cells.
 */
export const withInsertFragmentTable: WithOverride<TableConfig> = ({
  editor,
  plugin: { api, options },
}) => {
  const { insertFragment } = editor;
  const { disableExpandOnInsert } = options;

  editor.insertFragment = (fragment) => {
    const insertedTable = fragment.find(
      (n) => (n as TElement).type === editor.getType(TablePlugin)
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

              replaceNodeChildren(editor, {
                at: cellPath,
                nodes: cloneDeep(fragment) as any,
              });
            }
          });

          select(editor, {
            anchor: getStartPoint(editor, cellEntries[0][1]),
            focus: getEndPoint(editor, cellEntries.at(-1)![1]),
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
          withoutNormalizing(editor, () => {
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

                if (!hasNode(editor, cellPath)) {
                  if (disableExpandOnInsert) {
                    return;
                  } else {
                    api.table.insertRow?.({
                      disableSelect: true,
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

                  if (!hasNode(editor, cellPath)) {
                    if (disableExpandOnInsert) {
                      return;
                    } else {
                      api.table.insertColumn?.({
                        disableSelect: true,
                        fromCell,
                      });
                    }
                  }
                }

                initCell = false;

                const cellChildren = api.table.getCellChildren!(
                  cell
                ) as TTableCellElement[];

                replaceNodeChildren(editor, {
                  at: cellPath,
                  nodes: cloneDeep(cellChildren as any),
                });

                lastCellPath = [...cellPath];
              });
            });

            if (lastCellPath) {
              select(editor, {
                anchor: getStartPoint(editor, startCellPath),
                focus: getEndPoint(editor, lastCellPath),
              });
            }
          });

          return;
        }
      } else if (
        fragment.length === 1 &&
        fragment[0].type === TablePlugin.key
      ) {
        // needed to insert as node, otherwise it will be inserted as text
        editor.insertNode(fragment[0]);

        return;
      }
    }

    insertFragment(fragment);
  };

  return editor;
};
