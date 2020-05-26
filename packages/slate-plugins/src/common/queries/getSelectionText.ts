import { getText } from 'common/queries/getText';
import { Editor } from 'slate';

/**
 * Get the selected text.
 * Return empty string if no selection.
 */
export const getSelectionText = (editor: Editor) =>
  getText(editor, editor.selection);
