import type { Range } from 'slate';

import { DOMEditor } from 'slate-dom';

import type { Editor } from '../../interfaces/editor';

export const hasEditorRange = (editor: Editor, range: Range): boolean => {
  try {
    return DOMEditor.hasRange(editor as any, range);
  } catch (error) {}

  return false;
};
