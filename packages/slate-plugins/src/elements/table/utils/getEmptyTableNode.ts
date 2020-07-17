import { setDefaults } from '../../../common/utils/setDefaults';
import { DEFAULTS_TABLE } from '../defaults';
import { TableOptions } from '../types';
import { getEmptyRowNode } from './getEmptyRowNode';

export const getEmptyTableNode = (options?: TableOptions) => {
  const { table } = setDefaults(options, DEFAULTS_TABLE);

  return {
    type: table.type,
    children: [getEmptyRowNode(2, options), getEmptyRowNode(2, options)],
  };
};
