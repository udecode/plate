import type { Range } from 'slate';

import { DOMEditor } from 'slate-dom';

import type { TEditor } from '../editor';

export const hasEditorRange = (editor: TEditor, range: Range): boolean => {
  try {
    return DOMEditor.hasRange(editor as any, range);
  } catch (error) {}

  return false;
};
