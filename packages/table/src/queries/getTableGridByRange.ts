import {
  getNode,
  getPluginOptions,
  PlateEditor,
  TElement,
  TElementEntry,
  Value,
} from '@udecode/plate-common';
import { Range } from 'slate';

import { ELEMENT_TABLE } from '../createTablePlugin';
import { getTableMergeGridByRange } from '../merge/getTableGridByRange';
import { TablePlugin, TTableElement } from '../types';
import { getEmptyTableNode } from '../utils/getEmptyTableNode';

export interface GetTableGridByRangeOptions {
  at: Range;

  /**
   * Format of the output:
   * - table element
   * - array of cells
   */
  format?: 'table' | 'cell';
}

/**
 * Get sub table between 2 cell paths.
 */
export const getTableGridByRange = <V extends Value>(
  editor: PlateEditor<V>,
  { at, format = 'table' }: GetTableGridByRangeOptions
): TElementEntry[] => {
  const options = getPluginOptions<TablePlugin, V>(editor, ELEMENT_TABLE);
  if (!options.disableCellsMerging) {
    return getTableMergeGridByRange(editor, { at, format });
  }

  const startCellPath = at.anchor.path;
  const endCellPath = at.focus.path;

  const _startRowIndex = startCellPath.at(-2)!;
  const _endRowIndex = endCellPath.at(-2)!;
  const _startColIndex = startCellPath.at(-1)!;
  const _endColIndex = endCellPath.at(-1)!;

  const startRowIndex = Math.min(_startRowIndex, _endRowIndex);
  const endRowIndex = Math.max(_startRowIndex, _endRowIndex);
  const startColIndex = Math.min(_startColIndex, _endColIndex);
  const endColIndex = Math.max(_startColIndex, _endColIndex);

  const tablePath = startCellPath.slice(0, -2);

  const relativeRowIndex = endRowIndex - startRowIndex;
  const relativeColIndex = endColIndex - startColIndex;

  const table: TTableElement = getEmptyTableNode(editor, {
    rowCount: relativeRowIndex + 1,
    colCount: relativeColIndex + 1,
    newCellChildren: [],
  });

  let rowIndex = startRowIndex;
  let colIndex = startColIndex;

  const cellEntries: TElementEntry[] = [];

  while (true) {
    const cellPath = tablePath.concat([rowIndex, colIndex]);

    const cell = getNode<TElement>(editor, cellPath);
    if (!cell) break;

    const rows = table.children[rowIndex - startRowIndex]
      .children as TElement[];

    rows[colIndex - startColIndex] = cell;

    cellEntries.push([cell, cellPath]);

    if (colIndex + 1 <= endColIndex) {
      colIndex += 1;
    } else if (rowIndex + 1 <= endRowIndex) {
      colIndex = startColIndex;
      rowIndex += 1;
    } else {
      break;
    }
  }

  if (format === 'cell') {
    return cellEntries;
  }

  return [[table, tablePath]];
};
