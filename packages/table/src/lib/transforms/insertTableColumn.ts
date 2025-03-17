import {
  type Path,
  type SlateEditor,
  type TElement,
  getEditorPlugin,
  NodeApi,
  PathApi,
} from '@udecode/plate';

import type { TTableElement } from '../types';

import { BaseTableCellHeaderPlugin, BaseTablePlugin } from '../BaseTablePlugin';
import { insertTableMergeColumn } from '../merge/insertTableColumn';
import { getCellTypes } from '../utils/index';

export const insertTableColumn = (
  editor: SlateEditor,
  options: {
    /** Exact path of the cell to insert the column at. Will overrule `fromCell`. */
    at?: Path;
    /** Insert the column before the current column instead of after */
    before?: boolean;
    /** Path of the cell to insert the column from. */
    fromCell?: Path;
    header?: boolean;
    select?: boolean;
  } = {}
) => {
  const { api, getOptions, type } = getEditorPlugin(editor, BaseTablePlugin);

  const { disableMerge, initialTableWidth, minColumnWidth } = getOptions();

  if (!disableMerge) {
    return insertTableMergeColumn(editor, options);
  }

  const { before, header, select: shouldSelect } = options;
  let { at, fromCell } = options;

  if (at && !fromCell) {
    const table = NodeApi.get<TTableElement>(editor, at);

    if (table?.type === editor.getType(BaseTablePlugin)) {
      fromCell = NodeApi.lastChild(editor, at.concat([0]))![1];
      at = undefined;
    }
  }

  const cellEntry = editor.api.block({
    at: fromCell,
    match: { type: getCellTypes(editor) },
  });

  if (!cellEntry) return;

  const [, cellPath] = cellEntry;

  const tableEntry = editor.api.block<TTableElement>({
    above: true,
    at: cellPath,
    match: { type },
  });

  if (!tableEntry) return;

  const [tableNode, tablePath] = tableEntry;

  let nextCellPath: Path;
  let nextColIndex: number;

  if (PathApi.isPath(at)) {
    nextCellPath = at;
    nextColIndex = at.at(-1)!;
  } else {
    nextCellPath = before ? cellPath : PathApi.next(cellPath);
    nextColIndex = before ? cellPath.at(-1)! : cellPath.at(-1)! + 1;
  }

  const currentRowIndex = cellPath.at(-2);

  editor.tf.withoutNormalizing(() => {
    // for each row, insert a new cell
    tableNode.children.forEach((row, rowIndex) => {
      const insertCellPath = [...nextCellPath];

      if (PathApi.isPath(at)) {
        insertCellPath[at.length - 2] = rowIndex;
      } else {
        insertCellPath[cellPath.length - 2] = rowIndex;
      }

      const isHeaderRow =
        header === undefined
          ? (row as TElement).children.every(
              (c) => c.type === editor.getType(BaseTableCellHeaderPlugin)
            )
          : header;

      editor.tf.insertNodes(
        api.create.tableCell({
          header: isHeaderRow,
        }),
        {
          at: insertCellPath,
          select: shouldSelect && rowIndex === currentRowIndex,
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

      editor.tf.setNodes<TTableElement>(
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
