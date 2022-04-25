import { Transforms } from 'slate';
import { NodeMatchOption } from '../../../types/slate/NodeMatchOption';
import { TEditor, Value } from '../../../types/slate/TEditor';
import { ElementOf } from '../../../types/slate/TElement';
import { TextOf } from '../../../types/slate/TText';

export type InsertNodesOptions<V extends Value> = Parameters<
  typeof Transforms.insertNodes
>[2] &
  NodeMatchOption<V>;

/**
 * Insert nodes at a specific location in the Editor.
 */
export const insertNodes = <V extends Value>(
  editor: TEditor<V>,
  nodes:
    | ElementOf<TEditor<V>>
    | TextOf<TEditor<V>>
    | Array<ElementOf<TEditor<V>> | TextOf<TEditor<V>>>,
  options?: InsertNodesOptions<V>
) => Transforms.insertNodes(editor as any, nodes, options as any);
