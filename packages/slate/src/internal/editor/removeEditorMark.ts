import { removeMark } from 'slate';

import type { TEditor } from '../../interfaces/editor/TEditor';

export const removeEditorMark = (editor: TEditor, key: string) =>
  removeMark(editor as any, key);
