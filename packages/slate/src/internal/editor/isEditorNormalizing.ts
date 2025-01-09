import { isNormalizing } from 'slate';

import type { Editor } from '../../interfaces/editor/editor';

export const isEditorNormalizing = (editor: Editor) =>
  isNormalizing(editor as any);
