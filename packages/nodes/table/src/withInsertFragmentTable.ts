import {
  getBlockAbove,
  getPluginType,
  hasNode,
  insertNodes,
  PlateEditor,
  removeNodes,
  select,
  TElement,
  Value,
  withoutNormalizing,
  WithPlatePlugin,
} from '@udecode/plate-core';
import { cloneDeep } from 'lodash';
import { Path } from 'slate';
import { getTableGridAbove } from './queries/getTableGridAbove';
import { ELEMENT_TABLE } from './createTablePlugin';
import { TablePlugin } from './types';

/**
 * If inserting a table,
 * If block above anchor is a table,
 * - Replace each cell above by the inserted table until out of bounds.
 * - Select the inserted cells.
 */
export const withInsertFragmentTable = <
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>
>(
  editor: E,
  { options }: WithPlatePlugin<TablePlugin<V>>
) => {
  const { insertFragment } = editor;
  const { disableExpandOnInsert, insertColumn, insertRow } = options;

  editor.insertFragment = (fragment) => {
    const insertedTable = fragment.find(
      (n) => n.type === getPluginType(editor, ELEMENT_TABLE)
    );

    if (insertedTable) {
      const tableEntry = getBlockAbove(editor, {
        at: editor.selection?.anchor,
        match: {
          type: getPluginType(editor, ELEMENT_TABLE),
        },
      });

      // inserting inside table
      if (tableEntry) {
        const [cellEntry] = getTableGridAbove(editor, {
          format: 'cell',
        });

        if (cellEntry) {
          withoutNormalizing(editor, () => {
            const [, startCellPath] = cellEntry;
            const cellPath = [...startCellPath];

            const startColIndex = cellPath[cellPath.length - 1];
            let lastCellPath: Path | null = null;

            let initRow = true;
            const insertedRows = insertedTable.children as TElement[];
            insertedRows.forEach((row) => {
              cellPath[cellPath.length - 1] = startColIndex;

              // last inserted row
              if (!initRow) {
                const fromRow = cellPath.slice(0, -1);
                cellPath[cellPath.length - 2] += 1;

                if (!hasNode(editor, cellPath)) {
                  if (!disableExpandOnInsert) {
                    insertRow?.(editor, {
                      fromRow,
                    });
                  } else {
                    return;
                  }
                }
              }
              initRow = false;

              const insertedCells = row.children as TElement[];
              let initCell = true;

              insertedCells.forEach((cell) => {
                if (!initCell) {
                  const fromCell = [...cellPath];
                  cellPath[cellPath.length - 1] += 1;

                  if (!hasNode(editor, cellPath)) {
                    if (!disableExpandOnInsert) {
                      insertColumn?.(editor, {
                        fromCell,
                      });
                    } else {
                      return;
                    }
                  }
                }
                initCell = false;

                removeNodes(editor, {
                  at: cellPath,
                });
                insertNodes<TElement>(editor, cloneDeep(cell), {
                  at: cellPath,
                });

                lastCellPath = [...cellPath];
              });
            });

            if (lastCellPath) {
              select(editor, {
                anchor: {
                  offset: 0,
                  path: startCellPath,
                },
                focus: {
                  offset: 0,
                  path: lastCellPath,
                },
              });
            }
          });

          return;
        }
      }
    }

    insertFragment(fragment);
  };

  return editor;
};
