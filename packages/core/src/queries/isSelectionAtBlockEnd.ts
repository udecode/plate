import { GetAboveNodeOptions } from '../slate/editor/getAboveNode';
import { isEndPoint } from '../slate/editor/isEndPoint';
import { TEditor, Value } from '../slate/editor/TEditor';
import { getBlockAbove } from './getBlockAbove';

/**
 * Is the selection focus at the end of its parent block.
 */
export const isSelectionAtBlockEnd = <V extends Value>(
  editor: TEditor<V>,
  options?: GetAboveNodeOptions<V>
): boolean => {
  const path = getBlockAbove(editor, options)?.[1];

  return !!path && isEndPoint(editor, editor.selection?.focus, path);
};
