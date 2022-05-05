import { Transforms } from 'slate';
import { Modify } from '../../common/types/utility/types';
import { NodeMatchOption } from '../types/NodeMatchOption';
import { TEditor, Value } from '../types/TEditor';

export type UnsetNodesOptions<V extends Value> = Modify<
  NonNullable<Parameters<typeof Transforms.unsetNodes>[2]>,
  NodeMatchOption<V>
>;

/**
 * Unset properties on the nodes at a location.
 */
export const unsetNodes = <V extends Value>(
  editor: TEditor<V>,
  props: string | string[],
  options?: UnsetNodesOptions<V>
) => {
  return Transforms.unsetNodes(editor as any, props as any, options as any);
};
