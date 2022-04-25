import { Transforms } from 'slate';
import { NodeMatchOption } from '../../../types/slate/NodeMatchOption';
import { TEditor, Value } from '../../../types/slate/TEditor';

export type MoveNodesOptions<V extends Value> = Parameters<
  typeof Transforms.moveNodes
>[1] &
  NodeMatchOption<V>;

/**
 * Move the nodes at a location to a new location.
 */
export const moveNodes = <V extends Value>(
  editor: TEditor<V>,
  options: MoveNodesOptions<V>
) => Transforms.moveNodes(editor as any, options as any);
