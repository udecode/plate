import { Transforms } from 'slate';
import { Modify } from '../../common/types/utility/types';
import { NodeMatchOption } from '../types/NodeMatchOption';
import { TEditor, Value } from '../types/TEditor';
import { ENode } from '../types/TNode';

export type SetNodesOptions<V extends Value> = Modify<
  NonNullable<Parameters<typeof Transforms.setNodes>[2]>,
  NodeMatchOption<V>
>;

/**
 * Set new properties on the nodes at a location.
 */
export const setNodes = <V extends Value>(
  editor: TEditor<V>,
  props: Partial<ENode<V>>,
  options?: SetNodesOptions<V>
) => Transforms.setNodes(editor as any, props, options as any);
