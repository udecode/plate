import { Transforms } from 'slate';
import { Modify } from '../../common/types/utility/types';
import { NodeMatchOption } from '../types/NodeMatchOption';
import { TEditor, Value } from '../types/TEditor';
import { EElement } from '../types/TElement';
import { EText } from '../types/TText';

export type InsertNodesOptions<V extends Value> = Modify<
  NonNullable<Parameters<typeof Transforms.insertNodes>[2]>,
  NodeMatchOption<V>
>;

/**
 * Insert nodes at a specific location in the Editor.
 */
export const insertNodes = <V extends Value>(
  editor: TEditor<V>,
  nodes: EElement<V> | EText<V> | Array<EElement<V> | EText<V>>,
  options?: InsertNodesOptions<V>
) => Transforms.insertNodes(editor as any, nodes, options as any);
