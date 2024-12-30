import type { Range } from 'slate';

import { DOMEditor } from 'slate-dom';

import type { TEditor } from '../editor';

export const toDOMRange = (editor: TEditor, range: Range) => {
  try {
    return DOMEditor.toDOMRange(editor as any, range);
  } catch (error) {}
};
