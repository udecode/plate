import { TEditor } from '../../types/slate/TEditor';
import { getText } from './getText';

/**
 * Get the selected text.
 * Return empty string if no selection.
 */
export const getSelectionText = (editor: TEditor) =>
  getText(editor, editor.selection);
