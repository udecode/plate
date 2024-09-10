import { Editor, type EditorNormalizeOptions } from 'slate';

import type { TEditor } from './TEditor';

/** Normalize any dirty objects in the editor. */
export const normalizeEditor = (
  editor: TEditor,
  options?: EditorNormalizeOptions
) => Editor.normalize(editor as any, options);
