import { getPluginOptions, PlateEditor } from '@udecode/plate-common';

import { ELEMENT_TABLE } from '../createTablePlugin';
import {
  TablePlugin,
  TTableCellElement,
  TTableElement,
  TTableRowElement,
} from '../types';

export function getCellIndices(
  editor: PlateEditor,
  tableEl: TTableElement,
  cellEl: TTableCellElement
) {
  const options = getPluginOptions<TablePlugin>(editor, ELEMENT_TABLE);

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
    console.log('Invalid cell location.');
    return null;
  }

  const indices = { row: rowIndex, col: colIndex };

  options?._cellIndices?.set(cellEl, indices);

  return indices;
}

// const calculateCellIndexes = (
//   editor: PlateEditor,
//   tableNode: TTableElement
// ) => {
//   // Initialize an array to store the indices of each cell
//   const cellIndicesArray = [];

//   const tablePath = findNodePath(editor, tableNode)!;

//   // Iterate through the table rows
//   for (let r = 0; r < tableNode.children.length; r++) {
//     const row = tableNode.children[r] as TTableRowElement;
//     const rowIndicesArray = [];

//     // Iterate through the row cells
//     for (let c = 0; c < row.children.length; c++) {
//       const cell = row.children[c] as TTableCellElement;

//       // Get cell indices and store them in the row's array
//       const cellPath = [r, c];

//       const indices = getCellIndices(editor, tableNode, cell);
//       if (indices) {
//         cellIndices.set(cell, indices);
//       }
//       rowIndicesArray.push(indices);
//     }

//     // Push the rowIndicesArray to the cellIndicesArray
//     cellIndicesArray.push(rowIndicesArray);
//     console.log('calculated array', cellIndicesArray);
//   }

//   return cellIndicesArray;
// };
