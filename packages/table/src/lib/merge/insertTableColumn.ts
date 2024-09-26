import {
  type SlateEditor,
  findNode,
  getBlockAbove,
  getParentNode,
  insertElements,
  setNodes,
  withoutNormalizing,
} from '@udecode/plate-common';
import { getEditorPlugin } from '@udecode/plate-common';
import cloneDeep from 'lodash/cloneDeep';
import { Path } from 'slate';

import type {
  TTableCellElement,
  TTableElement,
  TTableRowElement,
} from '../types';

import { BaseTablePlugin } from '../BaseTablePlugin';
import { getColSpan } from '../queries/getColSpan';
import { getRowSpan } from '../queries/getRowSpan';
import { getCellTypes } from '../utils';
import { computeCellIndices } from './computeCellIndices';
import { findCellByIndexes } from './findCellByIndexes';
import { getCellIndices } from './getCellIndices';
import { getCellPath } from './getCellPath';

export const insertTableMergeColumn = (
  editor: SlateEditor,
  {
    at,
    fromCell,
    header,
  }: {
    /** Exact path of the cell to insert the column at. Will overrule `fromCell`. */
    at?: Path;

    /** Disable selection after insertion. */
    disableSelect?: boolean;

    /** Path of the cell to insert the column from. */
    fromCell?: Path;

    header?: boolean;
  } = {}
) => {
  const { api, getOptions, type } = getEditorPlugin(editor, BaseTablePlugin);
  const {
    _cellIndices: cellIndices,
    initialTableWidth,
    minColumnWidth,
  } = getOptions();

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
  const cell = cellEntry[0] as TTableCellElement;

  const tableEntry = getBlockAbove<TTableElement>(editor, {
    at: cellPath,
    match: { type },
  });

  if (!tableEntry) return;

  const [tableNode, tablePath] = tableEntry;

  const { col: cellColIndex } =
    getCellIndices(cellIndices!, cell) ||
    computeCellIndices(editor, tableNode, cell)!;
  const cellColSpan = getColSpan(cell);

  let nextColIndex: number;
  let checkingColIndex: number;

  if (Path.isPath(at)) {
    nextColIndex = cellColIndex;
    checkingColIndex = cellColIndex - 1;
  } else {
    nextColIndex = cellColIndex + cellColSpan;
    checkingColIndex = cellColIndex + cellColSpan - 1;
  }

  const rowNumber = tableNode.children.length;
  const firstCol = nextColIndex <= 0;

  // const colCount = getTableColumnCount(tableNode);
  // const lastRow = nextColIndex === colCount;

  let placementCorrection = 1;

  if (firstCol) {
    checkingColIndex = 0;
    placementCorrection = 0;
  }

  const affectedCellsSet = new Set();
  Array.from({ length: rowNumber }, (_, i) => i).forEach((rI) => {
    const found = findCellByIndexes(editor, tableNode, rI, checkingColIndex);

    if (found) {
      affectedCellsSet.add(found);
    }
  });
  const affectedCells = Array.from(affectedCellsSet) as TTableCellElement[];

  affectedCells.forEach((cur) => {
    const curCell = cur as TTableCellElement;
    const { col: curColIndex, row: curRowIndex } =
      getCellIndices(cellIndices!, curCell) ||
      computeCellIndices(editor, tableNode, curCell)!;
    const curRowSpan = getRowSpan(curCell);
    const curColSpan = getColSpan(curCell);

    const currentCellPath = getCellPath(
      editor,
      tableEntry,
      curRowIndex,
      curColIndex
    );

    const endCurI = curColIndex + curColSpan - 1;

    if (endCurI >= nextColIndex && !firstCol) {
      const colSpan = curColSpan + 1;
      const newCell = cloneDeep({ ...curCell, colSpan });

      if (newCell.attributes?.colspan) {
        newCell.attributes.colspan = colSpan.toString();
      }

      // make wider
      setNodes<TTableCellElement>(editor, newCell, { at: currentCellPath });
    } else {
      // add new
      const curRowPath = currentCellPath.slice(0, -1);
      const curColPath = currentCellPath.at(-1)!;
      const placementPath = [...curRowPath, curColPath + placementCorrection];

      const row = getParentNode(editor, currentCellPath)!;
      const rowElement = row[0] as TTableRowElement;
      const emptyCell = {
        ...api.create.cell!({ header, row: rowElement }),
        colSpan: 1,
        rowSpan: curRowSpan,
      };
      insertElements(editor, emptyCell, {
        at: placementPath,
        // select: !disableSelect && curRowIndex === currentRowIndex,
      });
    }
  });

  withoutNormalizing(editor, () => {
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
