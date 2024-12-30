import { type TEditor, getEditorString } from '../interfaces';

/** Get the selected text. Return empty string if no selection. */
export const getSelectionText = (editor: TEditor) =>
  getEditorString(editor, editor.selection);
