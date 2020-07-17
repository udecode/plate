import { Node } from 'slate';
import { setDefaults } from '../../../common/utils/setDefaults';
import { DEFAULTS_TABLE } from '../defaults';
import { TableOptions } from '../types';

export const isTableRow = (options?: TableOptions) => (n: Node) => {
  const { tr } = setDefaults(options, DEFAULTS_TABLE);

  return n.type === tr.type;
};
