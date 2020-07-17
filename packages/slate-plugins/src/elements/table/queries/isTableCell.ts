import { Node } from 'slate';
import { setDefaults } from '../../../common/utils/setDefaults';
import { DEFAULTS_TABLE } from '../defaults';
import { TableOptions } from '../types';

export const isTableCell = (options?: TableOptions) => (n: Node) => {
  const { td, th } = setDefaults(options, DEFAULTS_TABLE);

  return n.type === td.type || n.type === th.type;
};
