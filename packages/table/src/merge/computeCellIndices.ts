import { getPluginOptions, PlateEditor, Value } from '@udecode/plate-common/server';

import { ELEMENT_TABLE } from '../createTablePlugin';
import { getRowSpan } from '../queries/getRowSpan';
import {
  TablePlugin,
  TTableCellElement,
  TTableElement,
  TTableRowElement,
} from '../types';
import { getColSpan } from '../queries';

export function computeCellIndices<V extends Value>(
  editor: PlateEditor<V>,
  tableEl: TTableElement,
  cellEl: TTableCellElement
) {
  const options = getPluginOptions<TablePlugin, V>(editor, ELEMENT_TABLE);

  const tableNodes = tableEl.children;

  let rowIndex = -1;
  let colIndex = -1;

  for (let r = 0; r < tableNodes.length; r++) {
    const row = tableNodes[r] as TTableRowElement;

    let cIndex = 0;
    for (let c = 0; c < row.children.length; c++) {
      const cell = row.children[c] as TTableCellElement;
      if (cellEl === cell) {
        colIndex = cIndex;
        rowIndex = r;
        break;
      }
      cIndex += getColSpan(cell);
    }
  }

  tableNodes.slice(0, rowIndex).forEach((pR, _rowIndex) => {
    const prevRow = pR as TTableRowElement;
    prevRow.children.forEach((pC) => {
      const prevCell = pC as TTableCellElement;
      const prevIndices = options?._cellIndices?.get(prevCell);
      const _rowSpan = getRowSpan(prevCell);
      if (prevIndices) {
        const { col: prevColIndex } = prevIndices;
        if (
          // colIndex affects
          prevColIndex <= colIndex &&
          // rowSpan affects
          _rowSpan &&
          _rowSpan > 1 &&
          rowIndex - _rowIndex < _rowSpan
        ) {
          colIndex += getColSpan(prevCell);
        }
      }
    });
  });

  if (rowIndex === -1 || colIndex === -1) {
    return null;
  }

  const indices = { row: rowIndex, col: colIndex };
  options?._cellIndices?.set(cellEl, indices);

  return indices;
}

export const computeAllCellIndices = <V extends Value>(
  editor: PlateEditor<V>,
  tableNode: TTableElement
) => {
  const options = getPluginOptions<TablePlugin, V>(editor, ELEMENT_TABLE);

  // Iterate through the table rows
  for (let r = 0; r < tableNode.children.length; r++) {
    const row = tableNode.children[r] as TTableRowElement;

    // Iterate through the row cells
    for (let c = 0; c < row.children.length; c++) {
      const cell = row.children[c] as TTableCellElement;

      const indices = computeCellIndices(editor, tableNode, cell);
      if (indices) {
        options._cellIndices?.set(cell, indices);
      }
    }
  }
};
