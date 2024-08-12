import {
  type PlateEditor,
  getPluginOptions,
} from '@udecode/plate-common';

import type {
  TTableCellElement,
  TTableElement,
  TablePluginOptions,
} from '../types';

import { ELEMENT_TABLE } from '../TablePlugin';
import { getCellIndices } from '../merge/getCellIndices';
import { computeCellIndices } from './computeCellIndices';
import { getCellIndicesWithSpans } from './getCellIndicesWithSpans';

export const findCellByIndexes = (
  editor: PlateEditor,
  table: TTableElement,
  searchRowIndex: number,
  searchColIndex: number
) => {
  const { _cellIndices: cellIndices } = getPluginOptions<TablePluginOptions>(
    editor,
    ELEMENT_TABLE
  );

  const allCells = table.children.flatMap(
    (current) => current.children
  ) as TTableCellElement[];

  const foundCell = allCells.find((cell) => {
    const cellElement = cell as TTableCellElement;

    const indices =
      getCellIndices(cellIndices!, cellElement) ||
      computeCellIndices(editor, table, cellElement)!;

    const { col: _startColIndex, row: _startRowIndex } = indices;
    const { col: _endColIndex, row: _endRowIndex } = getCellIndicesWithSpans(
      indices,
      cellElement
    );

    if (
      searchColIndex >= _startColIndex &&
      searchColIndex <= _endColIndex &&
      searchRowIndex >= _startRowIndex &&
      searchRowIndex <= _endRowIndex
    ) {
      return true;
    }

    return false;
  });

  return foundCell;
};
