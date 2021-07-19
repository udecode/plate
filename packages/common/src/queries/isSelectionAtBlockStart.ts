import { TEditor } from '@udecode/plate-core';
import { getBlockAbove } from './getBlockAbove';
import { isStart } from './isStart';

/**
 * Is the selection focus at the start of its parent block.
 */
export const isSelectionAtBlockStart = (editor: TEditor) => {
  const path = getBlockAbove(editor)?.[1];

  return !!path && isStart(editor, editor.selection?.focus, path);
};
