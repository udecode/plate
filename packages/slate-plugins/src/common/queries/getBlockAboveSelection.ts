import { Editor } from 'slate';

/**
 * Get the block above the selection.
 */
export const getBlockAboveSelection = (editor: Editor) =>
  Editor.above(editor, {
    match: (n) => Editor.isBlock(editor, n),
  });
