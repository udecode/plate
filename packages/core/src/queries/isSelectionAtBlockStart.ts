import { GetAboveNodeOptions } from '../slate/editor/getAboveNode';
import { isStartPoint } from '../slate/editor/isStartPoint';
import { TEditor, Value } from '../slate/editor/TEditor';
import { getBlockAbove } from './getBlockAbove';

/**
 * Is the selection focus at the start of its parent block.
 *
 * Supports the same options provided by {@link getBlockAbove}.
 */
export const isSelectionAtBlockStart = <V extends Value>(
  editor: TEditor<V>,
  options?: GetAboveNodeOptions<V>
) => {
  const path = getBlockAbove(editor, options)?.[1];

  return !!path && isStartPoint(editor, editor.selection?.focus, path);
};
