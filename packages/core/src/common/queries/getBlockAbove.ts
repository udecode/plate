import {
  getAboveNode,
  GetAboveNodeOptions,
} from '../../slate/editor/getAboveNode';
import { TEditor, Value } from '../../slate/types/TEditor';

/**
 * Get the block above a location (default: selection).
 */
export const getBlockAbove = <V extends Value>(
  editor: TEditor<V>,
  options: GetAboveNodeOptions<V> = {}
) =>
  getAboveNode(editor, {
    ...options,
    block: true,
  });
