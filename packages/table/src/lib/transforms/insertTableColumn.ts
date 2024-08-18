import {
  type SlateEditor,
  type TElement,
  findNode,
  getBlockAbove,
  insertElements,
  setNodes,
  withoutNormalizing,
} from '@udecode/plate-common';
import { Path } from 'slate';

import type { TTableElement } from '../types';

import { TableCellHeaderPlugin, TablePlugin } from '../TablePlugin';
import { insertTableMergeColumn } from '../merge/insertTableColumn';
import { getCellTypes } from '../utils/index';

export const insertTableColumn = (
  editor: SlateEditor,
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
  const { enableMerging } = editor.getOptions(TablePlugin);

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
    match: { type: editor.getType(TablePlugin) },
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

  const { initialTableWidth, minColumnWidth } = editor.getOptions(TablePlugin);
  const api = editor.getApi(TablePlugin);

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
              (c) => c.type === editor.getType(TableCellHeaderPlugin)
            )
          : header;

      insertElements(
        editor,
        api.table.cellFactory!({
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
