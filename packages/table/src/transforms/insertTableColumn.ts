import {
  type PlateEditor,
  type TElement,
  findNode,
  getBlockAbove,
  getPluginOptions,
  getPluginType,
  insertElements,
  setNodes,
  withoutNormalizing,
} from '@udecode/plate-common/server';
import { Path } from 'slate';

import type { TTableElement, TablePluginOptions } from '../types';

import { ELEMENT_TABLE, ELEMENT_TH } from '../TablePlugin';
import { insertTableMergeColumn } from '../merge/insertTableColumn';
import { getCellTypes } from '../utils/index';

export const insertTableColumn = (
  editor: PlateEditor,
  options: {
    /** Exact path of the cell to insert the column at. Will overrule `fromCell`. */
    at?: Path;

    /** Disable selection after insertion. */
    disableSelect?: boolean;

    /** Path of the cell to insert the column from. */
    fromCell?: Path;

    header?: boolean;
  } = {}
) => {
  const { enableMerging } = getPluginOptions<TablePluginOptions>(
    editor,
    ELEMENT_TABLE
  );

  if (enableMerging) {
    return insertTableMergeColumn(editor, options);
  }

  const { at, disableSelect, fromCell, header } = options;

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
    at: cellPath,
    match: { type: getPluginType(editor, ELEMENT_TABLE) },
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

  const { cellFactory, initialTableWidth, minColumnWidth } =
    getPluginOptions<TablePluginOptions>(editor, ELEMENT_TABLE);

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
        cellFactory!({
          header: isHeaderRow,
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
