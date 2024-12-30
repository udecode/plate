import { Editor } from 'slate';

import type { TEditor } from './TEditor';

export const removeEditorMark = (editor: TEditor, key: string) =>
  Editor.removeMark(editor as any, key);
