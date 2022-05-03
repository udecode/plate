import { TEditor, Value } from '../../slate/types/TEditor';
import { ENode } from '../../slate/types/TNode';
import { findNode, FindNodeOptions } from './findNode';

/**
 * Iterate through all of the nodes in the editor and break early for the first truthy match. Otherwise
 * returns false.
 */
export const someNode = <V extends Value, N extends ENode<V>>(
  editor: TEditor<V>,
  options: FindNodeOptions<V>
) => {
  return !!findNode<V, N>(editor, options);
};
