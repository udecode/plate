import { Editor, EditorNormalizeOptions } from 'slate';

import { TEditor, Value } from './TEditor';

/**
 * Normalize any dirty objects in the editor.
 */
export const normalizeEditor = <V extends Value>(
  editor: TEditor<V>,
  options?: EditorNormalizeOptions
) => Editor.normalize(editor as any, options);
