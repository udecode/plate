import {
  findNodePath,
  getPluginOptions,
  PlateEditor,
  Value,
} from '@udecode/plate-common';

import { ELEMENT_TABLE } from '../createTablePlugin';
import {
  TablePlugin,
  TTableCellElement,
  TTableElement,
  TTableRowElement,
} from '../types';

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
      cIndex += cell.colSpan || 1; // consider 0 and undefined as 1
    }
  }

  tableNodes.slice(0, rowIndex).forEach((pR, _rowIndex) => {
    const prevRow = pR as TTableRowElement;
    prevRow.children.forEach((pC) => {
      const prevCell = pC as TTableCellElement;
      const prevIndices = options?._cellIndices?.get(prevCell);
      if (prevIndices) {
        const { col: prevColIndex } = prevIndices;
        if (
          // colIndex affects
          prevColIndex <= colIndex &&
          // rowSpan affects
          prevCell.rowSpan &&
          prevCell.rowSpan > 1 &&
          rowIndex - _rowIndex < prevCell.rowSpan
        ) {
          colIndex += prevCell.colSpan || 1;
        }
      }
    });
  });

  if (rowIndex === -1 || colIndex === -1) {
    // console.log('Invalid cell location.');
    return null;
  }

  const indices = { row: rowIndex, col: colIndex };
  const cellContent = cellEl.children?.map((i) => {
    return (i.children as any)[0].text;
  });
  // console.log('new cell location', cellContent, indices);

  options?._cellIndices?.set(cellEl, indices);

  return indices;
}

export const computeAllCellIndices = <V extends Value>(
  editor: PlateEditor<V>,
  tableNode: TTableElement
) => {
  const options = getPluginOptions<TablePlugin, V>(editor, ELEMENT_TABLE);

  // Initialize an array to store the indices of each cell
  const cellIndicesArray = [];

  // const tablePath = findNodePath(editor, tableNode)!;

  // Iterate through the table rows
  for (let r = 0; r < tableNode.children.length; r++) {
    const row = tableNode.children[r] as TTableRowElement;
    const rowIndicesArray = [];

    // Iterate through the row cells
    for (let c = 0; c < row.children.length; c++) {
      const cell = row.children[c] as TTableCellElement;

      // Get cell indices and store them in the row's array
      // const cellPath = [r, c];

      const indices = computeCellIndices(editor, tableNode, cell);
      if (indices) {
        options._cellIndices.set(cell, indices);
      }
      rowIndicesArray.push(indices);
    }

    // Push the rowIndicesArray to the cellIndicesArray
    cellIndicesArray.push(rowIndicesArray);
    // console.log('calculated array', cellIndicesArray);
  }

  return cellIndicesArray;
};
