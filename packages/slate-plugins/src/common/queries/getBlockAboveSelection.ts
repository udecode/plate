import { Ancestor, Editor, NodeEntry } from 'slate';

/**
 * Get the block above the selection. If not found, return the editor entry.
 */
export const getBlockAboveSelection = (editor: Editor): NodeEntry<Ancestor> =>
  Editor.above(editor, {
    match: (n) => Editor.isBlock(editor, n),
  }) || [editor, []];
