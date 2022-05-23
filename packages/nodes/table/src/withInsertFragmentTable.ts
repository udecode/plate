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
import { getCellTypes } from './utils/getCellType';
import { ELEMENT_TABLE } from './createTablePlugin';

export const tableFragmentTo = () => {};

export const withInsertFragmentTable = <
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>
>(
  editor: E
) => {
  const { insertFragment } = editor;

  editor.insertFragment = (fragment) => {
    /**
     * If selection in table:
     * - delete table
     * - delete t
     */
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
        // get anchor cell path
        const cellEntry = getBlockAbove(editor, {
          at: editor.selection?.anchor,
          match: {
            type: getCellTypes(editor),
          },
        });

        if (cellEntry) {
          const [, startCellPath] = cellEntry;
          const cellPath = [...startCellPath];
          const startColIndex = cellPath[cellPath.length - 1];

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
                select(editor, {
                  anchor: {
                    offset: 0,
                    path: startCellPath,
                  },
                  focus: {
                    offset: 0,
                    path: cellPath,
                  },
                });
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

          return;
        }
      }
    }

    insertFragment(fragment);
  };

  return editor;
};
