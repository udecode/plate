import { DOMEditor } from 'slate-dom';

import type { TEditor } from '../../interfaces/editor';

export const insertData = (editor: TEditor, data: DataTransfer) =>
  DOMEditor.insertData(editor as any, data);
