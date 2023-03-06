import { Transforms } from 'slate';
import { TEditor, Value } from '../interfaces/editor/TEditor';
import { Modify } from '../types/misc/types';
import { NodeMatchOption } from '../types/NodeMatchOption';

export type MoveNodesOptions<V extends Value = Value> = Modify<
  NonNullable<Parameters<typeof Transforms.moveNodes>[1]>,
  NodeMatchOption<V>
>;

/**
 * Move the nodes at a location to a new location.
 */
export const moveNodes = <V extends Value>(
  editor: TEditor<V>,
  options?: MoveNodesOptions<V>
) => Transforms.moveNodes(editor as any, options as any);
