import { removeMark } from 'slate';

import type { Editor } from '../../interfaces/editor/editor';

export const removeEditorMark = (editor: Editor, key: string) =>
  removeMark(editor as any, key);
