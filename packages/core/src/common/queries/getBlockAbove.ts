import { TAncestor } from '../../types/slate/TAncestor';
import { TEditor } from '../../types/slate/TEditor';
import {
  getAboveNode,
  GetAboveNodeOptions,
} from '../slate/editor/getAboveNode';

/**
 * Get the block above a location (default: selection).
 */
export const getBlockAbove = <T extends TAncestor = TAncestor>(
  editor: TEditor,
  options: GetAboveNodeOptions<T> = {}
) =>
  getAboveNode<T>(editor, {
    ...options,
    block: true,
  });
