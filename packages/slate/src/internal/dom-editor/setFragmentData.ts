import { DOMEditor } from 'slate-dom';

import type { Editor } from '../../interfaces/editor';

export const setFragmentData = (editor: Editor, data: DataTransfer) =>
  DOMEditor.setFragmentData(editor as any, data);
