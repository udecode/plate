import type { Element, ElementEntry, Range } from '@platejs/slate';
import {
  type SlateEditor,
  type TTableCellElement,
  type TTableElement,
  KEYS,
} from 'platejs';

import { type TableConfig, BaseTablePlugin } from '../../lib/BaseTablePlugin';
import { getTableMergeGridByRange } from '../merge/getTableGridByRange';
import { getColSpan } from './getColSpan';
import { getRowSpan } from './getRowSpan';

const hasMergedCells = (table?: TTableElement) =>
  !!table?.children.some((row) =>
    (row as Element & { children: TTableCellElement[] }).children.some(
      (cell: TTableCellElement) => {
        const tableCell = cell as TTableCellElement;

        return getColSpan(tableCell) > 1 || getRowSpan(tableCell) > 1;
      }
    )
  );

export type GetTableGridByRangeOptions = {
  at: Range;

  /**
   * Format of the output:
   *
   * - Table element
   * - Array of cells
   */
  format?: 'cell' | 'table';
};

/** Get sub table between 2 cell paths. */
export const getTableGridByRange = (
  editor: SlateEditor,
  { at, format = 'table' }: GetTableGridByRangeOptions
): ElementEntry[] => {
  const { api } = editor.getPlugin<TableConfig>({ key: KEYS.table });
  const { disableMerge } = editor.getOptions(BaseTablePlugin);
  const startCellPath = at.anchor.path;
  const endCellPath = at.focus.path;
  const tablePath = startCellPath.slice(0, -2);
  const tableNode = editor.api.node<TTableElement>(tablePath)?.[0];

  if (!tableNode) return [];

  if (!disableMerge && hasMergedCells(tableNode)) {
    return getTableMergeGridByRange(editor, { at, format });
  }

  const _startRowIndex = startCellPath.at(-2)!;
  const _endRowIndex = endCellPath.at(-2)!;
  const _startColIndex = startCellPath.at(-1)!;
  const _endColIndex = endCellPath.at(-1)!;

  const startRowIndex = Math.min(_startRowIndex, _endRowIndex);
  const endRowIndex = Math.max(_startRowIndex, _endRowIndex);
  const startColIndex = Math.min(_startColIndex, _endColIndex);
  const endColIndex = Math.max(_startColIndex, _endColIndex);

  const relativeRowIndex = endRowIndex - startRowIndex;
  const relativeColIndex = endColIndex - startColIndex;

  const table: TTableElement = api.create.table({
    children: [],
    colCount: relativeColIndex + 1,
    rowCount: relativeRowIndex + 1,
  });

  let rowIndex = startRowIndex;
  let colIndex = startColIndex;

  const cellEntries: ElementEntry[] = [];

  while (true) {
    const cellPath = tablePath.concat([rowIndex, colIndex]);

    const cell = editor.api.node<Element>(cellPath)?.[0];

    if (!cell) break;

    const rows = table.children[rowIndex - startRowIndex].children as Element[];

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
