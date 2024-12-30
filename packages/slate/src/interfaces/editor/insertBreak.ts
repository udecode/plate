import { Editor } from 'slate';

import type { TEditor } from './TEditor';

export const insertBreak = (editor: TEditor) =>
  Editor.insertBreak(editor as any);
