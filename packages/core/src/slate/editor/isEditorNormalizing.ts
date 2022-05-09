import { Editor } from 'slate';
import { TEditor, Value } from './TEditor';

/**
 * Check if the editor is currently normalizing after each operation.
 */
export const isEditorNormalizing = <V extends Value>(editor: TEditor<V>) =>
  Editor.isNormalizing(editor as any);
