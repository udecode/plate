import { defaultTableTypes } from '../types';
import { getEmptyCellNode } from './getEmptyCellNode';

export const getEmptyRowNode = (
  colCount: number,
  options = defaultTableTypes
) => ({
  type: options.typeTr,
  children: Array(colCount)
    .fill(colCount)
    .map(() => getEmptyCellNode(options)),
});
