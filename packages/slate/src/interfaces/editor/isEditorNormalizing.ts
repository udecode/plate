import { Editor } from 'slate';

import type { TEditor } from './TEditor';

/** Check if the editor is currently normalizing after each operation. */
export const isEditorNormalizing = (editor: TEditor) =>
  Editor.isNormalizing(editor as any);
