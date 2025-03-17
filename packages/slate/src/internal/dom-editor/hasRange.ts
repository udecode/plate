import { DOMEditor } from 'slate-dom';

import type { TRange } from '../../interfaces';
import type { Editor } from '../../interfaces/editor';

export const hasRange = (editor: Editor, range: TRange): boolean => {
  try {
    return DOMEditor.hasRange(editor as any, range);
  } catch {}

  return false;
};
