import { setDefaults } from '../../../common/utils/setDefaults';
import { DEFAULTS_TABLE } from '../defaults';
import { TableOptions } from '../types';

export const getEmptyCellNode = (
  options?: TableOptions & { header?: boolean }
) => {
  const { th, td, header } = setDefaults(options, DEFAULTS_TABLE);

  return {
    type: header ? th.type : td.type,
    children: [{ text: '' }],
  };
};
