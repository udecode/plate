import { isNormalizing } from 'slate';

import type { TEditor } from './TEditor';

export const isEditorNormalizing = (editor: TEditor) =>
  isNormalizing(editor as any);
