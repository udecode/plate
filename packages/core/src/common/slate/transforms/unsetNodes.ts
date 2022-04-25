import { Transforms } from 'slate';
import { NodeMatchOption } from '../../../types/slate/NodeMatchOption';
import { TEditor, Value } from '../../../types/slate/TEditor';

export type UnsetNodesOptions<V extends Value> = Parameters<
  typeof Transforms.unsetNodes
>[2] &
  NodeMatchOption<V>;

/**
 * Unset properties on the nodes at a location.
 */
export const unsetNodes = <V extends Value>(
  editor: TEditor<V>,
  props: string | string[],
  options: UnsetNodesOptions<V> = {}
) => {
  return Transforms.unsetNodes(editor as any, props as any, options as any);
};
