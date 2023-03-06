import { Transforms } from 'slate';
import { TEditor, Value } from '../interfaces/editor/TEditor';
import { ENode, TNodeProps } from '../interfaces/node/TNode';
import { Modify } from '../types/misc/types';
import { NodeMatchOption } from '../types/NodeMatchOption';

export type SetNodesOptions<V extends Value = Value> = Modify<
  NonNullable<Parameters<typeof Transforms.setNodes>[2]>,
  NodeMatchOption<V>
>;

/**
 * Set new properties on the nodes at a location.
 */
export const setNodes = <N extends ENode<V>, V extends Value = Value>(
  editor: TEditor<V>,
  props: Partial<TNodeProps<N>>,
  options?: SetNodesOptions<V>
) => Transforms.setNodes(editor as any, props, options as any);
