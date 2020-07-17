import { setDefaults } from '../../../common/utils/setDefaults';
import { DEFAULTS_TABLE } from '../defaults';
import { TableOptions } from '../types';
import { getEmptyCellNode } from './getEmptyCellNode';

export const getEmptyRowNode = (colCount: number, options?: TableOptions) => {
  const { tr } = setDefaults(options, DEFAULTS_TABLE);

  return {
    type: tr.type,
    children: Array(colCount)
      .fill(colCount)
      .map(() => getEmptyCellNode(options)),
  };
};
