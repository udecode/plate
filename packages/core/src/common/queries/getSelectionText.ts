import { TEditor } from '../../types/slate/TEditor';
import { getEditorString } from '../slate/editor/getEditorString';

/**
 * Get the selected text.
 * Return empty string if no selection.
 */
export const getSelectionText = (editor: TEditor) =>
  getEditorString(editor, editor.selection);
