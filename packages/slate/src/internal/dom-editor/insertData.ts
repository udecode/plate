import { DOMEditor } from 'slate-dom';

import type { Editor } from '../../interfaces/editor';

export const insertData = (editor: Editor, data: DataTransfer) =>
  DOMEditor.insertData(editor as any, data);
