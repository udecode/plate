import { Editor } from 'slate';
import { TEditor, Value } from './TEditor';

export type NormalizeEditorOptions = Parameters<typeof Editor.normalize>[1];

/**
 * Normalize any dirty objects in the editor.
 */
export const normalizeEditor = <V extends Value>(
  editor: TEditor<V>,
  options?: NormalizeEditorOptions
) => Editor.normalize(editor as any, options);
