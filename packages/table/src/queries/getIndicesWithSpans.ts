import { Value } from '@udecode/plate-common';

import { TablePlugin, TTableCellElement } from '../types';
import { getColSpan } from './getColSpan';
import { getRowSpan } from './getRowSpan';

export const getIndicesWithSpans = (
  { col, row }: { col: number; row: number },
  endCell: TTableCellElement
) => {
  return {
    row: row + getRowSpan(endCell) - 1,
    col: col + getColSpan(endCell) - 1,
  };
};
