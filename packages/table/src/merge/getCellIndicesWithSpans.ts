import { getColSpan } from '../queries/getColSpan';
import { getRowSpan } from '../queries/getRowSpan';
import { TTableCellElement } from '../types';

export const getCellIndicesWithSpans = (
  { col, row }: { col: number; row: number },
  endCell: TTableCellElement
) => {
  return {
    row: row + getRowSpan(endCell) - 1,
    col: col + getColSpan(endCell) - 1,
  };
};
