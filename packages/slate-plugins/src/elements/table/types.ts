export enum TableType {
  TABLE = 'table',
  ROW = 'table-row',
  CELL = 'table-cell',
}

export interface RenderElementTableOptions {
  Table?: any;
  Row?: any;
  Cell?: any;
}

export const emptyCell = () => ({
  type: TableType.CELL,
  children: [{ text: '' }],
});

export const emptyRow = (colCount: number) => ({
  type: TableType.ROW,
  children: Array(colCount)
    .fill(colCount)
    .map(() => emptyCell()),
});

export const emptyTable = () => ({
  type: TableType.TABLE,
  children: [emptyRow(2), emptyRow(2)],
});
