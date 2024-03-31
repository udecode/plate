import {
  createPathRef,
  getAboveNode,
  getPluginOptions,
  getPluginType,
  isExpanded,
  PlateEditor,
  removeNodes,
  setNodes,
  someNode,
  TElement,
  TNodeEntry,
  Value,
  withoutNormalizing,
} from '@udecode/plate-common';
import { PathRef } from 'slate';

import {
  ELEMENT_TABLE,
  ELEMENT_TD,
  ELEMENT_TH,
  ELEMENT_TR,
} from '../createTablePlugin';
import { deleteTableMergeColumn } from '../merge/deleteColumn';
import { getTableGridAbove } from '../queries';
import { TablePlugin, TTableCellElement, TTableElement } from '../types';
import { getCellRowIndexByPath } from '../utils/getCellRowIndexByPath';

export const deleteColumn = <V extends Value>(editor: PlateEditor<V>) => {
  const { enableMerging } = getPluginOptions<TablePlugin, V>(
    editor,
    ELEMENT_TABLE
  );
  if (enableMerging) {
    return deleteTableMergeColumn(editor);
  }

  const tableEntry = getAboveNode<TTableElement>(editor, {
    match: { type: getPluginType(editor, ELEMENT_TABLE) },
  });

  if (!tableEntry) return;

  if (isExpanded(editor.selection)) {
    const rowCount = tableEntry[0].children.length;

    const cells = getTableGridAbove(editor, {
      format: 'cell',
    }) as TNodeEntry<TTableCellElement>[];

    let lastCellRowIndex = -1;
    let selectionRowCount = 0;

    const pathRefs: PathRef[] = [];

    cells.forEach(([cell, cellPath], index) => {
      const currentCellRowIndex = getCellRowIndexByPath(cellPath);

      // not on the same line
      if (currentCellRowIndex !== lastCellRowIndex) {
        selectionRowCount += 1;
      }

      pathRefs.push(createPathRef(editor, cellPath));
      lastCellRowIndex = currentCellRowIndex;
    });

    if (rowCount === selectionRowCount) {
      pathRefs.forEach((pathRef) => {
        removeNodes(editor, { at: pathRef.unref()! });
      });
    }

    return;
  }

  if (
    someNode(editor, {
      match: { type: getPluginType(editor, ELEMENT_TABLE) },
    })
  ) {
    const tdEntry = getAboveNode(editor, {
      match: {
        type: [
          getPluginType(editor, ELEMENT_TD),
          getPluginType(editor, ELEMENT_TH),
        ],
      },
    });
    const trEntry = getAboveNode(editor, {
      match: { type: getPluginType(editor, ELEMENT_TR) },
    });

    if (
      tdEntry &&
      trEntry &&
      tableEntry &&
      // Cannot delete the last cell
      trEntry[0].children.length > 1
    ) {
      const [tableNode, tablePath] = tableEntry;

      const tdPath = tdEntry[1];
      const colIndex = tdPath.at(-1)!;

      const pathToDelete = tdPath.slice();
      const replacePathPos = pathToDelete.length - 2;

      withoutNormalizing(editor, () => {
        tableNode.children.forEach((row, rowIdx) => {
          pathToDelete[replacePathPos] = rowIdx;

          // for tables containing rows of different lengths
          // - don't delete if only one cell in row
          // - don't delete if row doesn't have this cell
          if (
            (row.children as TElement[]).length === 1 ||
            colIndex > (row.children as TElement[]).length - 1
          )
            return;

          removeNodes(editor, {
            at: pathToDelete,
          });
        });

        const { colSizes } = tableNode;

        if (colSizes) {
          const newColSizes = [...colSizes];
          newColSizes.splice(colIndex, 1);

          setNodes<TTableElement>(
            editor,
            {
              colSizes: newColSizes,
            },
            {
              at: tablePath,
            }
          );
        }
      });
    }
  }
};
