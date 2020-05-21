import { defaultTableTypes } from 'elements/table/types';
import { getEmptyCellNode } from 'elements/table/utils/getEmptyCellNode';

export const getEmptyRowNode = (
  colCount: number,
  options = defaultTableTypes
) => ({
  type: options.typeTr,
  children: Array(colCount)
    .fill(colCount)
    .map(() => getEmptyCellNode(options)),
});
