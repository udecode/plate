import { TEditor } from '@udecode/plate-core';
import { getBlockAbove } from './getBlockAbove';
import { isEnd } from './isEnd';

/**
 * Is the selection focus at the end of its parent block.
 */
export const isSelectionAtBlockEnd = (editor: TEditor): boolean => {
  const path = getBlockAbove(editor)?.[1];

  return !!path && isEnd(editor, editor.selection?.focus, path);
};
