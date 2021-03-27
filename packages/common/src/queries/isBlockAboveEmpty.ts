import { Editor } from 'slate';
import { getBlockAbove } from './getBlockAbove';
import { isAncestorEmpty } from './isAncestorEmpty';

/**
 * Is the block above the selection empty.
 */
export const isBlockAboveEmpty = (editor: Editor) => {
  const block = getBlockAbove(editor)?.[0];
  if (!block) return false;
  return isAncestorEmpty(editor, block);
};
