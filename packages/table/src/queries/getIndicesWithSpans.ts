import { Value } from '@udecode/plate-common';

import { TablePlugin, TTableCellElement } from '../types';
import { getColSpan } from './getColSpan';
import { getRowSpan } from './getRowSpan';

export const getIndicesWithSpans = (
  options: TablePlugin<Value>,
  endCell: TTableCellElement
) => {
  const { col: __endColIndex, row: __endRowIndex } =
    options._cellIndices.get(endCell)!;

  // TODO: improve typing
  const _endRowIndex = __endRowIndex + getRowSpan(endCell) - 1;
  const _endColIndex = __endColIndex + getColSpan(endCell) - 1;

  return { _endRowIndex, _endColIndex };
};
