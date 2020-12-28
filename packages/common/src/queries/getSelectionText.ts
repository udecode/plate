import { Editor } from 'slate';
import { getText } from './getText';

/**
 * Get the selected text.
 * Return empty string if no selection.
 */
export const getSelectionText = (editor: Editor) =>
  getText(editor, editor.selection);
