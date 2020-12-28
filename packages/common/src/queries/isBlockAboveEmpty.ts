import { Editor } from 'slate';
import { getBlockAbove } from './getBlockAbove';
import { isAncestorEmpty } from './isAncestorEmpty';

/**
 * Is the block above the selection empty.
 */
export const isBlockAboveEmpty = (editor: Editor) => {
  const blockEntry = getBlockAbove(editor);
  const [block] = blockEntry;
  return isAncestorEmpty(editor, block);
};
