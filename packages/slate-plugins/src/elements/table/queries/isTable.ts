import { Node } from 'slate';
import { setDefaults } from '../../../common/utils/setDefaults';
import { DEFAULTS_TABLE } from '../defaults';
import { TableOptions } from '../types';

export const isTable = (options?: TableOptions) => (n: Node) => {
  const { table } = setDefaults(options, DEFAULTS_TABLE);

  return n.type === table.type;
};
