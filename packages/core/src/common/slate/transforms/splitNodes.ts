import { Transforms } from 'slate';
import { NodeMatchOption } from '../../../types/slate/NodeMatchOption';
import { TEditor, Value } from '../../../types/slate/TEditor';

export type SplitNodesOptions<V extends Value> = Parameters<
  typeof Transforms.splitNodes
>[1] &
  NodeMatchOption<V>;

/**
 * Split the nodes at a specific location.
 */
export const splitNodes = <V extends Value>(
  editor: TEditor<V>,
  options: SplitNodesOptions<V>
) => Transforms.splitNodes(editor as any, options as any);
