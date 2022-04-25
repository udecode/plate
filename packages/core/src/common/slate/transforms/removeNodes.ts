import { Transforms } from 'slate';
import { NodeMatchOption } from '../../../types/slate/NodeMatchOption';
import { TEditor, Value } from '../../../types/slate/TEditor';

export type RemoveNodesOptions<V extends Value> = Parameters<
  typeof Transforms.removeNodes
>[1] &
  NodeMatchOption<V>;

/**
 * Remove the nodes at a specific location in the document.
 */
export const removeNodes = <V extends Value>(
  editor: TEditor<V>,
  options: RemoveNodesOptions<V> = {}
) => Transforms.removeNodes(editor as any, options as any);
