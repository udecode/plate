import { TEditor } from '@udecode/plate-core';
import { getText } from './getText';

/**
 * Get the selected text.
 * Return empty string if no selection.
 */
export const getSelectionText = (editor: TEditor) =>
  getText(editor, editor.selection);
