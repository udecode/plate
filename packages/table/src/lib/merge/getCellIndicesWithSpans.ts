import type { TTableCellElement } from 'platejs';

import { getColSpan } from '../queries/getColSpan';
import { getRowSpan } from '../queries/getRowSpan';

export const getCellIndicesWithSpans = (
  { col, row }: { col: number; row: number },
  endCell: TTableCellElement
) => ({
  col: col + getColSpan(endCell) - 1,
  row: row + getRowSpan(endCell) - 1,
});
