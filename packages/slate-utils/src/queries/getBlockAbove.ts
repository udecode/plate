import {
  getAboveNode,
  GetAboveNodeOptions,
} from '../slate/editor/getAboveNode';
import { TEditor, Value } from '../slate/editor/TEditor';
import { EAncestor } from '../slate/node/TAncestor';

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
