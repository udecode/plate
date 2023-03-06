import { Transforms } from 'slate';
import { TEditor, Value } from '../interfaces/editor/TEditor';
import { EElementOrText } from '../interfaces/element/TElement';
import { Modify } from '../types/misc/types';
import { NodeMatchOption } from '../types/NodeMatchOption';

export type InsertNodesOptions<V extends Value = Value> = Modify<
  NonNullable<Parameters<typeof Transforms.insertNodes>[2]>,
  NodeMatchOption<V>
>;

/**
 * Insert nodes at a specific location in the Editor.
 */
export const insertNodes = <
  N extends EElementOrText<V>,
  V extends Value = Value
>(
  editor: TEditor<V>,
  nodes: N | N[],
  options?: InsertNodesOptions<V>
) => Transforms.insertNodes(editor as any, nodes, options as any);
