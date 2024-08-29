import type { SlateEditor } from '@udecode/plate-common';

import type {
  TTableCellElement,
  TTableElement,
  TTableRowElement,
} from '../types';

import { TablePlugin } from '../TablePlugin';
import { getColSpan } from '../queries';
import { getRowSpan } from '../queries/getRowSpan';

export function computeCellIndices(
  editor: SlateEditor,
  tableEl: TTableElement,
  cellEl: TTableCellElement
) {
  const options = editor.getOptions(TablePlugin);

  const tableNodes = tableEl.children;

  let rowIndex = -1;
  let colIndex = -1;

  for (let r = 0; r < tableNodes.length; r++) {
    const row = tableNodes[r] as TTableRowElement;

    let cIndex = 0;

    for (const item of row.children) {
      const cell = item as TTableCellElement;

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

  const indices = { col: colIndex, row: rowIndex };
  options?._cellIndices?.set(cellEl, indices);

  return indices;
}

export const computeAllCellIndices = (
  editor: SlateEditor,
  tableNode: TTableElement
) => {
  const options = editor.getOptions(TablePlugin);

  // Iterate through the table rows
  for (const tableChild of tableNode.children) {
    const row = tableChild as TTableRowElement;

    // Iterate through the row cells
    for (const rowChild of row.children) {
      const cell = rowChild as TTableCellElement;

      const indices = computeCellIndices(editor, tableNode, cell);

      if (indices) {
        options._cellIndices?.set(cell, indices);
      }
    }
  }
};
