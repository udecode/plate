import {
  EAncestor,
  getAboveNode,
  GetAboveNodeOptions,
  TEditor,
  Value,
} from '@udecode/slate';

/**
 * Get the block above a location (default: selection).
 */
export const getBlockAbove = <N extends EAncestor<V>, V extends Value = Value>(
  editor: TEditor<V>,
  options: GetAboveNodeOptions<V> = {}
) =>
  getAboveNode<N, V>(editor, {
    ...options,
    block: true,
  });
