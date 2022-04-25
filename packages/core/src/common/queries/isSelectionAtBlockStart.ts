import { TAncestor } from '../../types/slate/TAncestor';
import { TEditor } from '../../types/slate/TEditor';
import { AnyObject } from '../../types/utility/AnyObject';
import { GetAboveNodeOptions } from '../slate/editor/getAboveNode';
import { isStart } from './slate/isStart';
import { getBlockAbove } from './getBlockAbove';

/**
 * Is the selection focus at the start of its parent block.
 *
 * Supports the same options provided by {@link getBlockAbove}.
 */
export const isSelectionAtBlockStart = (
  editor: TEditor,
  options?: GetAboveNodeOptions<TAncestor<AnyObject>>
) => {
  const path = getBlockAbove(editor, options)?.[1];

  return !!path && isStart(editor, editor.selection?.focus, path);
};
