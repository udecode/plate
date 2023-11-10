import { Value } from '@udecode/plate-common';

import { TablePlugin, TTableCellElement } from '../types';

export const getIndices = (
  options: TablePlugin<Value>,
  startCell: TTableCellElement
) => {
  const { col: _startColIndex, row: _startRowIndex } =
    options._cellIndices.get(startCell)!;

  return { _startColIndex, _startRowIndex };
};
