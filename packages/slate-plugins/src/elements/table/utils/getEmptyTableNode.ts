import { defaultTableTypes } from 'elements/table/types';
import { getEmptyRowNode } from 'elements/table/utils/getEmptyRowNode';

export const getEmptyTableNode = (options = defaultTableTypes) => ({
  type: options.typeTable,
  children: [getEmptyRowNode(2, options), getEmptyRowNode(2, options)],
});
