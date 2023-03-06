import {
  GetAboveNodeOptions,
  isExpanded,
  isStartPoint,
  TEditor,
  Value,
} from '@udecode/slate';
import { getBlockAbove } from './getBlockAbove';

/**
 * Is the selection anchor or focus at the start of its parent block.
 *
 * Supports the same options provided by {@link getBlockAbove}.
 */
export const isSelectionAtBlockStart = <V extends Value>(
  editor: TEditor<V>,
  options?: GetAboveNodeOptions<V>
) => {
  const { selection } = editor;
  if (!selection) return false;

  const path = getBlockAbove(editor, options)?.[1];
  if (!path) return false;

  return (
    isStartPoint(editor, selection.focus, path) ||
    (isExpanded(editor.selection) &&
      isStartPoint(editor, selection.anchor, path))
  );
};
