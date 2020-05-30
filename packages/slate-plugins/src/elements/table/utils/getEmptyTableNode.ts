import { defaultTableTypes } from '../types';
import { getEmptyRowNode } from './getEmptyRowNode';

export const getEmptyTableNode = (options = defaultTableTypes) => ({
  type: options.typeTable,
  children: [getEmptyRowNode(2, options), getEmptyRowNode(2, options)],
});
