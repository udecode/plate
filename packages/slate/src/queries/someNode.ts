import type { ENode, TEditor, Value } from '../interfaces';

import { type FindNodeOptions, findNode } from './findNode';

/**
 * Iterate through all of the nodes in the editor and break early for the first
 * truthy match. Otherwise returns false.
 */
export const someNode = <N extends ENode<V>, V extends Value = Value>(
  editor: TEditor<V>,
  options: FindNodeOptions<V>
) => {
  return !!findNode<N, V>(editor, options);
};
