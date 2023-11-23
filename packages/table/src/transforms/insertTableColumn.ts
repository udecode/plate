import {
  findNode,
  getBlockAbove,
  getPluginOptions,
  getPluginType,
  insertElements,
  PlateEditor,
  setNodes,
  TElement,
  Value,
  withoutNormalizing,
} from '@udecode/plate-common';
import { Path } from 'slate';

import { ELEMENT_TABLE, ELEMENT_TH } from '../createTablePlugin';
import { insertTableMergeColumn } from '../merge/insertTableColumn';
import { TablePlugin, TTableElement } from '../types';
import { getEmptyCellNode } from '../utils/getEmptyCellNode';
import { getCellTypes } from '../utils/index';

export const insertTableColumn = <V extends Value>(
  editor: PlateEditor<V>,
  options: {
    header?: boolean;

    /**
     * Path of the cell to insert the column from.
     */
    fromCell?: Path;

    /**
     * Exact path of the cell to insert the column at.
     * Will overrule `fromCell`.
     */
    at?: Path;

    /**
     * Disable selection after insertion.
     */
    disableSelect?: boolean;
  } = {}
) => {
  const { enableMerging } = getPluginOptions<TablePlugin, V>(
    editor,
    ELEMENT_TABLE
  );
  if (enableMerging) {
    return insertTableMergeColumn(editor, options);
  }

  const { disableSelect, fromCell, at, header } = options;

  const cellEntry = fromCell
    ? findNode(editor, {
        at: fromCell,
        match: { type: getCellTypes(editor) },
      })
    : getBlockAbove(editor, {
        match: { type: getCellTypes(editor) },
      });
  if (!cellEntry) return;

  const [, cellPath] = cellEntry;

  const tableEntry = getBlockAbove<TTableElement>(editor, {
    match: { type: getPluginType(editor, ELEMENT_TABLE) },
    at: cellPath,
  });
  if (!tableEntry) return;

  const [tableNode, tablePath] = tableEntry;

  let nextCellPath: Path;
  let nextColIndex: number;

  if (Path.isPath(at)) {
    nextCellPath = at;
    nextColIndex = at.at(-1)!;
  } else {
    nextCellPath = Path.next(cellPath);
    nextColIndex = cellPath.at(-1)! + 1;
  }
  const currentRowIndex = cellPath.at(-2);

  const { newCellChildren, initialTableWidth, minColumnWidth } =
    getPluginOptions<TablePlugin, V>(editor, ELEMENT_TABLE);

  withoutNormalizing(editor, () => {
    // for each row, insert a new cell
    tableNode.children.forEach((row, rowIndex) => {
      const insertCellPath = [...nextCellPath];
      if (Path.isPath(at)) {
        insertCellPath[at.length - 2] = rowIndex;
      } else {
        insertCellPath[cellPath.length - 2] = rowIndex;
      }

      const isHeaderRow =
        header === undefined
          ? (row as TElement).children.every(
              (c) => c.type === getPluginType(editor, ELEMENT_TH)
            )
          : header;

      insertElements(
        editor,
        getEmptyCellNode(editor, {
          header: isHeaderRow,
          newCellChildren,
        }),
        {
          at: insertCellPath,
          select: !disableSelect && rowIndex === currentRowIndex,
        }
      );
    });

    const { colSizes } = tableNode;

    if (colSizes) {
      let newColSizes = [
        ...colSizes.slice(0, nextColIndex),
        0,
        ...colSizes.slice(nextColIndex),
      ];

      if (initialTableWidth) {
        newColSizes[nextColIndex] =
          colSizes[nextColIndex] ??
          colSizes[nextColIndex - 1] ??
          initialTableWidth / colSizes.length;

        const oldTotal = colSizes.reduce((a, b) => a + b, 0);
        const newTotal = newColSizes.reduce((a, b) => a + b, 0);
        const maxTotal = Math.max(oldTotal, initialTableWidth);

        if (newTotal > maxTotal) {
          const factor = maxTotal / newTotal;
          newColSizes = newColSizes.map((size) =>
            Math.max(minColumnWidth ?? 0, Math.floor(size * factor))
          );
        }
      }

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
};
