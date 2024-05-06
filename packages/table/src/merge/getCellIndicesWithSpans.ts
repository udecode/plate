import type { TTableCellElement } from '../types';

import { getColSpan } from '../queries/getColSpan';
import { getRowSpan } from '../queries/getRowSpan';

export const getCellIndicesWithSpans = (
  { col, row }: { col: number; row: number },
  endCell: TTableCellElement
) => {
  return {
    col: col + getColSpan(endCell) - 1,
    row: row + getRowSpan(endCell) - 1,
  };
};
