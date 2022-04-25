import { Editor } from 'slate';
import { TEditor, Value } from '../../../types/slate/TEditor';

/**
 * Insert text at the current selection.
 *
 * If the selection is currently expanded, it will be deleted first.
 */
export const insertText = <V extends Value>(editor: TEditor<V>, text: string) =>
  Editor.insertText(editor as any, text as any);
