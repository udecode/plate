import {
  findNode,
  getPluginType,
  PlateEditor,
  TElement,
  TElementEntry,
  Value,
} from '@udecode/plate-common';
import { Range } from 'slate';

import { ELEMENT_TABLE } from '../createTablePlugin';
import { TTableCellElement, TTableElement, TTableRowElement } from '../types';
import { findCellByIndexes, getCellTypes } from '../utils';
import { getCellPath } from '../utils/getCellPath';
import { getEmptyTableNode } from '../utils/getEmptyTableNode';

export type FormatType = 'table' | 'cell' | 'all';

export interface TableGridEntries {
  tableEntries: TElementEntry[];
  cellEntries: TElementEntry[];
}

export type GetTableGridReturnType<T> = T extends 'all'
  ? TableGridEntries
  : TElementEntry[];

export interface GetTableGridByRangeOptions<T extends FormatType> {
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
 */
export const getTableGridByRange = <T extends FormatType, V extends Value>(
  editor: PlateEditor<V>,
  { at, format }: GetTableGridByRangeOptions<T>
): GetTableGridReturnType<T> => {
  const startCellEntry = findNode(editor, {
    at: (at as any).anchor.path,
    match: { type: getCellTypes(editor) },
  })!; // TODO: improve typing
  const endCellEntry = findNode(editor, {
    at: (at as any).focus.path,
    match: { type: getCellTypes(editor) },
  })!;

  const startCell = startCellEntry[0] as TTableCellElement;
  const endCell = endCellEntry[0] as TTableCellElement;

  const startCellPath = (at as any).anchor.path;
  const tablePath = startCellPath.slice(0, -2);

  // TODO: improve typing
  const _startRowIndex = startCell.rowIndex!;
  const _endRowIndex = endCell.rowIndex! + endCell.rowSpan! - 1;
  const _startColIndex = startCell.colIndex!;
  const _endColIndex = endCell.colIndex! + endCell.colSpan! - 1;

  const startRowIndex = Math.min(_startRowIndex, _endRowIndex);
  const endRowIndex = Math.max(_startRowIndex, _endRowIndex);
  const startColIndex = Math.min(_startColIndex, _endColIndex);
  const endColIndex = Math.max(_startColIndex, _endColIndex);

  const relativeRowIndex = endRowIndex - startRowIndex;
  const relativeColIndex = endColIndex - startColIndex;

  const table: TTableElement = getEmptyTableNode(editor, {
    rowCount: relativeRowIndex + 1,
    colCount: relativeColIndex + 1,
    newCellChildren: [],
  });

  const tableEntry = findNode<TTableElement>(editor, {
    at: tablePath,
    match: { type: getPluginType(editor, ELEMENT_TABLE) },
  })!; // TODO: improve typing
  const realTable = tableEntry[0] as TTableElement;

  const cellEntries: TElementEntry[] = [];
  const cellsSet = new Set();

  let rowIndex = startRowIndex;
  let colIndex = startColIndex;
  while (true) {
    const cell = findCellByIndexes(realTable, rowIndex, colIndex);
    if (!cell) {
      break;
    }

    if (!cellsSet.has(cell)) {
      cellsSet.add(cell);

      const rows = table.children[rowIndex - startRowIndex]
        .children as TElement[];
      rows[colIndex - startColIndex] = cell;
      const cellPath = getCellPath(tableEntry, cell);

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
