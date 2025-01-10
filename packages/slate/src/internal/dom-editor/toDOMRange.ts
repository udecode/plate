import { DOMEditor } from 'slate-dom';

import type { Editor } from '../../interfaces/editor';
import type { TRange } from '../../interfaces/range';

export const toDOMRange = (editor: Editor, range: TRange) => {
  try {
    return DOMEditor.toDOMRange(editor as any, range);
  } catch {}
};
