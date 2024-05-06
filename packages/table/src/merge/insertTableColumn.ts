import {
  findNode,
  getBlockAbove,
  getParentNode,
  getPluginOptions,
  getPluginType,
  insertElements,
  PlateEditor,
  setNodes,
  Value,
  withoutNormalizing,
} from '@udecode/plate-common';
import { Path } from 'slate';

import { ELEMENT_TABLE } from '../createTablePlugin';
import { getColSpan } from '../queries/getColSpan';
import { getRowSpan } from '../queries/getRowSpan';
import {
  TablePlugin,
  TTableCellElement,
  TTableElement,
  TTableRowElement,
} from '../types';
import { getCellTypes } from '../utils';
import { computeCellIndices } from './computeCellIndices';
import { createEmptyCell } from './createEmptyCell';
import { findCellByIndexes } from './findCellByIndexes';
import { getCellIndices } from './getCellIndices';
import { getCellPath } from './getCellPath';

export const insertTableMergeColumn = <V extends Value>(
  editor: PlateEditor<V>,
  {
    disableSelect,
    fromCell,
    at,
    header,
  }: {
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
  const { _cellIndices: cellIndices } = getPluginOptions<TablePlugin, V>(
    editor,
    ELEMENT_TABLE
  );

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
    match: { type: getPluginType(editor, ELEMENT_TABLE) },
    at: cellPath,
  });
  if (!tableEntry) return;

  const { newCellChildren, initialTableWidth, minColumnWidth } =
    getPluginOptions<TablePlugin, V>(editor, ELEMENT_TABLE);
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
    const { row: curRowIndex, col: curColIndex } =
      getCellIndices(cellIndices!, curCell) ||
      computeCellIndices(editor, tableNode, cell)!;
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
      // make wider
      setNodes<TTableCellElement>(
        editor,
        { ...curCell, colSpan: curColSpan + 1 },
        { at: currentCellPath }
      );
    } else {
      // add new
      const curRowPath = currentCellPath.slice(0, -1);
      const curColPath = currentCellPath.at(-1)!;
      const placementPath = [...curRowPath, curColPath + placementCorrection];

      const row = getParentNode(editor, currentCellPath)!;
      const rowElement = row[0] as TTableRowElement;
      const emptyCell = {
        ...createEmptyCell(editor, rowElement, newCellChildren, header),
        rowSpan: curRowSpan,
        colSpan: 1,
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
