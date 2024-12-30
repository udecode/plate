import { DOMEditor } from 'slate-dom';

import type { TEditor } from '../editor';

export const setFragmentData = (editor: TEditor, data: DataTransfer) =>
  DOMEditor.setFragmentData(editor as any, data);
