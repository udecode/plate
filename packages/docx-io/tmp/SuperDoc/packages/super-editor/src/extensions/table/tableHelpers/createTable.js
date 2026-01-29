import { getNodeType } from '@core/helpers/getNodeType.js';
import { createCell } from './createCell.js';
import { createTableBorders } from './createTableBorders.js';

export const createTable = (schema, rowsCount, colsCount, withHeaderRow, cellContent = null) => {
  const types = {
    table: getNodeType('table', schema),
    tableRow: getNodeType('tableRow', schema),
    tableCell: getNodeType('tableCell', schema),
    tableHeader: getNodeType('tableHeader', schema),
  };

  const headerCells = [];
  const cells = [];

  for (let index = 0; index < colsCount; index++) {
    const cell = createCell(types.tableCell, cellContent);
    if (cell) cells.push(cell);
    if (withHeaderRow) {
      const headerCell = createCell(types.tableHeader, cellContent);
      if (headerCell) {
        headerCells.push(headerCell);
      }
    }
  }

  const rows = [];

  for (let index = 0; index < rowsCount; index++) {
    const cellsToInsert = withHeaderRow && index === 0 ? headerCells : cells;
    rows.push(types.tableRow.createChecked(null, cellsToInsert));
  }

  const tableBorders = createTableBorders();

  return types.table.createChecked({ borders: tableBorders }, rows);
};
