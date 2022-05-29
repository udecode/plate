import {
  getBlockAbove,
  getNode,
  getPluginType,
  insertNodes,
  PlateEditor,
  removeNodes,
  select,
  TElement,
  Value,
  withoutNormalizing,
} from '@udecode/plate-core';
import { cloneDeep } from 'lodash';
import { Path } from 'slate';
import { getTableGridAbove } from './queries/getTableGridAbove';
import { ELEMENT_TABLE } from './createTablePlugin';

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
  editor: E
) => {
  const { insertFragment } = editor;

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
          const [, startCellPath] = cellEntry;
          const cellPath = [...startCellPath];
          const startColIndex = cellPath[cellPath.length - 1];
          let lastCellPath: Path | null = null;

          const insertedRows = insertedTable.children as TElement[];
          insertedRows.forEach((row, rowIndex) => {
            const insertedCells = row.children as TElement[];

            insertedCells.forEach((cell, cellIndex) => {
              withoutNormalizing(editor, () => {
                const hasNode = getNode(editor, cellPath);
                if (!hasNode) return;

                removeNodes(editor, {
                  at: cellPath,
                });
                insertNodes<TElement>(editor, cloneDeep(cell), {
                  at: cellPath,
                });

                lastCellPath = [...cellPath];
              });

              if (cellIndex < insertedCells.length - 1) {
                cellPath[cellPath.length - 1] += 1;
              }
            });

            if (rowIndex < insertedRows.length - 1) {
              cellPath[cellPath.length - 1] = startColIndex;
              cellPath[cellPath.length - 2] += 1;
            }
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

          return;
        }
      }
    }

    insertFragment(fragment);
  };

  return editor;
};
