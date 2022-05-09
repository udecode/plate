import { Transforms } from 'slate';
import { Modify } from '../../common/types/utility/types';
import { NodeMatchOption } from '../types/NodeMatchOption';
import { TEditor, Value } from '../editor/TEditor';

export type RemoveNodesOptions<V extends Value> = Modify<
  NonNullable<Parameters<typeof Transforms.removeNodes>[1]>,
  NodeMatchOption<V>
>;

/**
 * Remove the nodes at a specific location in the document.
 */
export const removeNodes = <V extends Value>(
  editor: TEditor<V>,
  options?: RemoveNodesOptions<V>
) => Transforms.removeNodes(editor as any, options as any);
