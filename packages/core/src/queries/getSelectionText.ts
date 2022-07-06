import { getEditorString } from '../slate/editor/getEditorString';
import { TEditor, Value } from '../slate/editor/TEditor';

/**
 * Get the selected text.
 * Return empty string if no selection.
 */
export const getSelectionText = <V extends Value>(editor: TEditor<V>) =>
  getEditorString(editor, editor.selection);
