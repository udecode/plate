import type { NodeOf, TEditor } from '../interfaces';

import { type FindNodeOptions, findNode } from './findNode';

/**
 * Iterate through all of the nodes in the editor and break early for the first
 * truthy match. Otherwise returns false.
 */
export const someNode = <N extends NodeOf<E>, E extends TEditor = TEditor>(
  editor: E,
  options: FindNodeOptions<E>
) => {
  return !!findNode<N, E>(editor, options);
};
