import { isNormalizing } from 'slate';

import type { TEditor } from '../../interfaces/editor/TEditor';

export const isEditorNormalizing = (editor: TEditor) =>
  isNormalizing(editor as any);
