import { Transforms } from 'slate';
import { NodeMatchOption } from '../../../types/slate/NodeMatchOption';
import { TEditor, Value } from '../../../types/slate/TEditor';
import { NodeOf } from '../../../types/slate/TNode';

export type SetNodesOptions<V extends Value> = Parameters<
  typeof Transforms.setNodes
>[2] &
  NodeMatchOption<V>;

/**
 * Set new properties on the nodes at a location.
 */
export const setNodes = <V extends Value>(
  editor: TEditor<V>,
  props: Partial<NodeOf<TEditor<V>>>,
  options?: SetNodesOptions<V>
) => Transforms.setNodes(editor as any, props, options as any);
