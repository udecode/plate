import type { GetAboveNodeOptions } from '../interfaces/editor/editor-types';

import { type TEditor, type ValueOf, isExpanded } from '../interfaces';
import { getBlockAbove } from './getBlockAbove';

/**
 * Is the selection anchor or focus at the start of its parent block.
 *
 * Supports the same options provided by {@link getBlockAbove}.
 */
export const isSelectionAtBlockStart = <E extends TEditor>(
  editor: E,
  options?: GetAboveNodeOptions<ValueOf<E>>
) => {
  const { selection } = editor;

  if (!selection) return false;

  const path = getBlockAbove(editor, options)?.[1];

  if (!path) return false;

  return (
    editor.api.isStart(selection.focus, path) ||
    (isExpanded(editor.selection) && editor.api.isStart(selection.anchor, path))
  );
};
