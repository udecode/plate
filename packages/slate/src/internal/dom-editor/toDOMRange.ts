import type { Range } from 'slate';

import { DOMEditor } from 'slate-dom';

import type { Editor } from '../../interfaces/editor';

export const toDOMRange = (editor: Editor, range: Range) => {
  try {
    return DOMEditor.toDOMRange(editor as any, range);
  } catch (error) {}
};
