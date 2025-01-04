import type { FindNodeOptions, TEditor, ValueOf } from '../interfaces';

import { findNode } from '../internal/queries/findNode';

/**
 * Iterate through all of the nodes in the editor and break early for the first
 * truthy match. Otherwise returns false.
 */
export const someNode = <E extends TEditor = TEditor>(
  editor: E,
  options: FindNodeOptions<ValueOf<E>>
) => {
  return !!findNode(editor, options);
};
