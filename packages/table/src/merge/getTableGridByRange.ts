import {
  findNode,
  findNodePath,
  getPluginOptions,
  getPluginType,
  PlateEditor,
  TElement,
  TElementEntry,
  Value,
} from '@udecode/plate-common';
import { Range } from 'slate';

import { ELEMENT_TABLE } from '../createTablePlugin';
import { computeCellIndices } from '../merge/computeCellIndices';
import { findCellByIndexes } from '../merge/findCellByIndexes';
import { getCellIndices } from '../merge/getCellIndices';
import { getCellIndicesWithSpans } from '../merge/getCellIndicesWithSpans';
import {
  TablePlugin,
  TTableCellElement,
  TTableElement,
  TTableRowElement,
} from '../types';
import { getCellTypes } from '../utils';
import { getEmptyTableNode } from '../utils/getEmptyTableNode';
import { getColSpan, getRowSpan } from '../queries';

type FormatType = 'table' | 'cell' | 'all';

interface TableGridEntries {
  tableEntries: TElementEntry[];
  cellEntries: TElementEntry[];
}

type GetTableGridReturnType<T> = T extends 'all'
  ? TableGridEntries
  : TElementEntry[];

interface GetTableGridByRangeOptions<T extends FormatType> {
  at: Range;

  /**
   * Format of the output:
   * - table element
   * - array of cells
   */
  format?: T;
}

/**
 * Get sub table between 2 cell paths.
 * Ensure that the selection is always a valid table grid.
 */
export const getTableMergeGridByRange = <T extends FormatType, V extends Value>(
  editor: PlateEditor<V>,
  { at, format }: GetTableGridByRangeOptions<T>
): GetTableGridReturnType<T> => {
  const { _cellIndices: cellIndices } = getPluginOptions<TablePlugin, V>(
    editor,
    ELEMENT_TABLE
  );

  const startCellEntry = findNode<TTableCellElement>(editor, {
    at: at.anchor.path,
    match: { type: getCellTypes(editor) },
  })!;
  const endCellEntry = findNode<TTableCellElement>(editor, {
    at: at.focus.path,
    match: { type: getCellTypes(editor) },
  })!;

  const startCell = startCellEntry[0];
  const endCell = endCellEntry[0];

  const startCellPath = at.anchor.path;
  const tablePath = startCellPath.slice(0, -2);

  const tableEntry = findNode<TTableElement>(editor, {
    at: tablePath,
    match: { type: getPluginType(editor, ELEMENT_TABLE) },
  })!;
  const realTable = tableEntry[0];

  const { col: _startColIndex, row: _startRowIndex } = getCellIndicesWithSpans(
    getCellIndices(cellIndices!, startCell) ||
      computeCellIndices(editor, realTable, startCell)!,
      startCell
  );

  const { row: _endRowIndex, col: _endColIndex } = getCellIndicesWithSpans(
    getCellIndices(cellIndices!, endCell) ||
      computeCellIndices(editor, realTable, endCell)!,
    endCell
  );

  let startRowIndex = Math.min(_startRowIndex, _endRowIndex);
  let endRowIndex = Math.max(_startRowIndex, _endRowIndex);
  let startColIndex = Math.min(_startColIndex, _endColIndex);
  let endColIndex = Math.max(_startColIndex, _endColIndex);

  const relativeRowIndex = endRowIndex - startRowIndex;
  const relativeColIndex = endColIndex - startColIndex;

  const table: TTableElement = getEmptyTableNode(editor, {
    rowCount: relativeRowIndex + 1,
    colCount: relativeColIndex + 1,
    newCellChildren: [],
  });

  const cellEntries: TElementEntry[] = [];
  let cellsSet = new WeakSet();

  let rowIndex = startRowIndex;
  let colIndex = startColIndex;
  while (true) {
    const cell = findCellByIndexes(editor, realTable, rowIndex, colIndex);
    if (!cell) {
      break;
    }

    const rowSpan = getRowSpan(cell);
    const colSpan = getColSpan(cell);
    const { row: cellRow, col: cellCol } = getCellIndices(cellIndices!, cell)!;

    // check if cell is still in range
    const hasOverflowTop = cellRow < startRowIndex;
    const hasOverflowBottom = cellRow + rowSpan - 1 > endRowIndex;
    const hasOverflowLeft = cellCol < startColIndex;
    const hasOverflowRight = cellCol + colSpan - 1 > endColIndex;
    if (hasOverflowTop || hasOverflowBottom || hasOverflowLeft || hasOverflowRight) {
      cellsSet = new WeakSet();
      startRowIndex = Math.min(startRowIndex, cellRow);
      endRowIndex = Math.max(endRowIndex, cellRow + rowSpan - 1);
      startColIndex = Math.min(startColIndex, cellCol);
      endColIndex = Math.max(endColIndex, cellCol + colSpan - 1);
      rowIndex = startRowIndex;
      colIndex = startColIndex;
      continue;
    }

    if (!cellsSet.has(cell)) {
      cellsSet.add(cell);

      const rows = table.children[rowIndex - startRowIndex]
        .children as TElement[];
      rows[colIndex - startColIndex] = cell;

      const cellPath = findNodePath(editor, cell)!;
      cellEntries.push([cell, cellPath]);
    }

    if (colIndex + 1 <= endColIndex) {
      colIndex = colIndex + 1;
    } else if (rowIndex + 1 <= endRowIndex) {
      colIndex = startColIndex;
      rowIndex = rowIndex + 1;
    } else {
      break;
    }
  }

  const formatType = (format as string) || 'table';

  if (formatType === 'cell') {
    return cellEntries as GetTableGridReturnType<T>;
  }

  // clear redundant cells
  table.children?.forEach((rowEl) => {
    const rowElement = rowEl as TTableRowElement;

    const filteredChildren = rowElement.children?.filter((cellEl) => {
      const cellElement = cellEl as TTableCellElement;
      return !!cellElement?.children.length;
    });

    rowElement.children = filteredChildren;
  });

  if (formatType === 'table') {
    return [[table, tablePath]] as GetTableGridReturnType<T>;
  }

  return {
    tableEntries: [[table, tablePath]],
    cellEntries,
  } as GetTableGridReturnType<T>;
};
