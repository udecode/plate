import { Editor } from 'slate';
import { getBlockAboveSelection } from './getBlockAboveSelection';
import { isEnd } from './isEnd';

/**
 * Is the selection focus at the end of its parent block.
 */
export const isSelectionAtBlockEnd = (editor: Editor) => {
  const [, path] = getBlockAboveSelection(editor);

  return isEnd(editor, editor.selection?.focus, path);
};
