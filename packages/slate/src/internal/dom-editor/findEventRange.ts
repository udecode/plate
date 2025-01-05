import { DOMEditor } from 'slate-dom';

import type { TEditor } from '../../interfaces/editor';

export const findEventRange = (editor: TEditor, event: any) => {
  try {
    return DOMEditor.findEventRange(editor as any, event);
  } catch (error) {}
};
