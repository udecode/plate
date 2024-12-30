import { DOMEditor } from 'slate-dom';

import type { TEditor } from '../editor';

export const insertData = (editor: TEditor, data: DataTransfer) =>
  DOMEditor.insertData(editor as any, data);
