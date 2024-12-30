import { Editor } from 'slate';

import type { TEditor } from './TEditor';

export const isEditorNormalizing = (editor: TEditor) =>
  Editor.isNormalizing(editor as any);
