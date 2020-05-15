export enum TableType {
  TABLE = 'table',
  ROW = 'tr',
  CELL = 'td',
}

export interface TableTypeOptions {
  typeTable?: string;
  typeTr?: string;
  typeTd?: string;
}

export interface RenderElementTableOptions extends TableTypeOptions {
  Table?: any;
  Row?: any;
  Cell?: any;
}

export const defaultTableTypes: Required<TableTypeOptions> = {
  typeTable: TableType.TABLE,
  typeTr: TableType.ROW,
  typeTd: TableType.CELL,
};

export const emptyCell = (options = defaultTableTypes) => ({
  type: options.typeTd,
  children: [{ text: '' }],
});

export const emptyRow = (colCount: number, options = defaultTableTypes) => ({
  type: options.typeTr,
  children: Array(colCount)
    .fill(colCount)
    .map(() => emptyCell(options)),
});

export const emptyTable = (options = defaultTableTypes) => ({
  type: options.typeTable,
  children: [emptyRow(2, options), emptyRow(2, options)],
});
