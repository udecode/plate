import { removeMark } from 'slate';

import type { TEditor } from './TEditor';

export const removeEditorMark = (editor: TEditor, key: string) =>
  removeMark(editor as any, key);
