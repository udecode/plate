import type { ElementEntry, Element, Range } from '@platejs/plite';
import { type BaseEditor, getEditorPlugin } from '@platejs/core';
import type {
  TTableCellElement,
  TTableElement,
  TTableRowElement,
} from '@platejs/utils';

import { BaseTablePlugin } from '../BaseTablePlugin';
import { getCellTypes } from '../utils';
import { getCellIndices } from '../utils/getCellIndices';
import { findCellByIndexes } from './findCellByIndexes';
import { getCellIndicesWithSpans } from './getCellIndicesWithSpans';

type FormatType = 'all' | 'cell' | 'table';

type GetTableGridByRangeOptions<T extends FormatType> = {
  at: Range;

  /**
   * Format of the output:
   *
   * - Table element
   * - Array of cells
   */
  format?: T;
};

type TableGridEntries = {
  cellEntries: ElementEntry[];
  tableEntries: ElementEntry[];
};

/**
 * Get sub table between 2 cell paths. Ensure that the selection is always a
 * valid table grid.
 */
export function getTableMergeGridByRange(
  editor: BaseEditor,
  options: GetTableGridByRangeOptions<'all'>
): TableGridEntries;
export function getTableMergeGridByRange(
  editor: BaseEditor,
  options: GetTableGridByRangeOptions<'cell' | 'table'>
): ElementEntry[];
export function getTableMergeGridByRange(
  editor: BaseEditor,
  { at, format }: GetTableGridByRangeOptions<FormatType>
): ElementEntry[] | TableGridEntries {
  const { api, type } = getEditorPlugin(editor, BaseTablePlugin);

  const startCellEntry = editor.read.nodes.above<TTableCellElement>({
    at: at.anchor.path,
    match: { type: getCellTypes(editor) },
  });
  const endCellEntry = editor.read.nodes.above<TTableCellElement>({
    at: at.focus.path,
    match: { type: getCellTypes(editor) },
  });

  if (!startCellEntry || !endCellEntry) {
    return format === 'all' ? { cellEntries: [], tableEntries: [] } : [];
  }

  const startCell = startCellEntry[0];
  const endCell = endCellEntry[0];

  const startCellPath = startCellEntry[1];
  const tablePath = startCellPath.slice(0, -2);

  const tableEntry = editor.read.nodes.get<TTableElement>(tablePath);

  if (!tableEntry || tableEntry[0].type !== type) {
    return format === 'all' ? { cellEntries: [], tableEntries: [] } : [];
  }
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

  let table: TTableElement = api.createTable({
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
      table = api.createTable({
        children: [],
        colCount: newRelativeColIndex + 1,
        rowCount: newRelativeRowIndex + 1,
      });

      continue;
    }
    if (!cellsSet.has(cell)) {
      cellsSet.add(cell);

      const rows = table.children[rowIndex - startRowIndex]
        .children as Element[];
      rows[colIndex - startColIndex] = cell;

      const cellPath = editor.read.nodes.path(cell);

      if (!cellPath) continue;

      cellEntries.push([cell, cellPath]);
    }
    if (colIndex + 1 <= endColIndex) {
      colIndex += 1;
    } else if (rowIndex + 1 <= endRowIndex) {
      colIndex = startColIndex;
      rowIndex += 1;
    } else {
      break;
    }
  }

  const formatType = (format as string) || 'table';

  if (formatType === 'cell') {
    return cellEntries;
  }

  // clear redundant cells
  table.children?.forEach((rowEl) => {
    const rowElement = rowEl as TTableRowElement;

    const filteredChildren = rowElement.children?.filter((cellEl) => {
      const cellElement = cellEl as TTableCellElement;

      return api.getCellChildren!(cellElement).length > 0;
    });

    rowElement.children = filteredChildren;
  });

  if (formatType === 'table') {
    return [[table, tablePath]];
  }

  return {
    cellEntries,
    tableEntries: [[table, tablePath]],
  };
}
