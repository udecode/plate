import type { TEditor } from '../interfaces';

/** Get the selected text. Return empty string if no selection. */
export const getSelectionText = (editor: TEditor) =>
  editor.api.string(editor.selection);
