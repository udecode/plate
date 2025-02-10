import {
  type ElementEntry,
  type SlateEditor,
  type TElement,
  type TRange,
  getEditorPlugin,
} from '@udecode/plate';

import type {
  TTableCellElement,
  TTableElement,
  TTableRowElement,
} from '../types';

import { BaseTablePlugin } from '../BaseTablePlugin';
import { getCellTypes } from '../utils';
import { getCellIndices } from '../utils/getCellIndices';
import { findCellByIndexes } from './findCellByIndexes';
import { getCellIndicesWithSpans } from './getCellIndicesWithSpans';

type FormatType = 'all' | 'cell' | 'table';

interface GetTableGridByRangeOptions<T extends FormatType> {
  at: TRange;

  /**
   * Format of the output:
   *
   * - Table element
   * - Array of cells
   */
  format?: T;
}

type GetTableGridReturnType<T> = T extends 'all'
  ? TableGridEntries
  : ElementEntry[];

interface TableGridEntries {
  cellEntries: ElementEntry[];
  tableEntries: ElementEntry[];
}

/**
 * Get sub table between 2 cell paths. Ensure that the selection is always a
 * valid table grid.
 */
export const getTableMergeGridByRange = <T extends FormatType>(
  editor: SlateEditor,
  { at, format }: GetTableGridByRangeOptions<T>
): GetTableGridReturnType<T> => {
  const { api, type } = getEditorPlugin(editor, BaseTablePlugin);

  const startCellEntry = editor.api.node<TTableCellElement>({
    at: at.anchor.path,
    match: { type: getCellTypes(editor) },
  })!;
  const endCellEntry = editor.api.node<TTableCellElement>({
    at: at.focus.path,
    match: { type: getCellTypes(editor) },
  })!;

  const startCell = startCellEntry[0];
  const endCell = endCellEntry[0];

  const startCellPath = at.anchor.path;
  const tablePath = startCellPath.slice(0, -2);

  const tableEntry = editor.api.node<TTableElement>({
    at: tablePath,
    match: { type },
  })!;
  const realTable = tableEntry[0];

  const { col: _startColIndex, row: _startRowIndex } = getCellIndicesWithSpans(
    getCellIndices(editor, startCell),
    startCell
  );

  const { col: _endColIndex, row: _endRowIndex } = getCellIndicesWithSpans(
    getCellIndices(editor, endCell),
    endCell
  );

  let startRowIndex = Math.min(_startRowIndex, _endRowIndex);
  let endRowIndex = Math.max(_startRowIndex, _endRowIndex);
  let startColIndex = Math.min(_startColIndex, _endColIndex);
  let endColIndex = Math.max(_startColIndex, _endColIndex);

  const relativeRowIndex = endRowIndex - startRowIndex;
  const relativeColIndex = endColIndex - startColIndex;

  let table: TTableElement = api.create.table({
    children: [],
    colCount: relativeColIndex + 1,
    rowCount: relativeRowIndex + 1,
  });

  let cellEntries: ElementEntry[] = [];
  let cellsSet = new WeakSet();

  let rowIndex = startRowIndex;
  let colIndex = startColIndex;

  while (true) {
    const cell = findCellByIndexes(editor, realTable, rowIndex, colIndex);

    if (!cell) {
      break;
    }

    const indicies = getCellIndices(editor, cell);
    const { col: cellColWithSpan, row: cellRowWithSpan } =
      getCellIndicesWithSpans(indicies, cell);
    const { col: cellCol, row: cellRow } = indicies;

    // check if cell is still in range
    const hasOverflowTop = cellRow < startRowIndex;
    const hasOverflowBottom = cellRowWithSpan > endRowIndex;
    const hasOverflowLeft = cellCol < startColIndex;
    const hasOverflowRight = cellColWithSpan > endColIndex;

    if (
      hasOverflowTop ||
      hasOverflowBottom ||
      hasOverflowLeft ||
      hasOverflowRight
    ) {
      // reset the cycle if has overflow
      cellsSet = new WeakSet();
      cellEntries = [];
      startRowIndex = Math.min(startRowIndex, cellRow);
      endRowIndex = Math.max(endRowIndex, cellRowWithSpan);
      startColIndex = Math.min(startColIndex, cellCol);
      endColIndex = Math.max(endColIndex, cellColWithSpan);
      rowIndex = startRowIndex;
      colIndex = startColIndex;
      const newRelativeRowIndex = endRowIndex - startRowIndex;
      const newRelativeColIndex = endColIndex - startColIndex;
      table = api.create.table({
        children: [],
        colCount: newRelativeColIndex + 1,
        rowCount: newRelativeRowIndex + 1,
      });

      continue;
    }
    if (!cellsSet.has(cell)) {
      cellsSet.add(cell);

      const rows = table.children[rowIndex - startRowIndex]
        .children as TElement[];
      rows[colIndex - startColIndex] = cell;

      const cellPath = editor.api.findPath(cell)!;

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

      return api.table.getCellChildren!(cellElement).length > 0;
    });

    rowElement.children = filteredChildren;
  });

  if (formatType === 'table') {
    return [[table, tablePath]] as GetTableGridReturnType<T>;
  }

  return {
    cellEntries,
    tableEntries: [[table, tablePath]],
  } as GetTableGridReturnType<T>;
};
