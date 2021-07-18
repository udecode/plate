import { TEditor } from '@udecode/slate-plugins-core';
import { Editor } from 'slate';

/**
 * Get selected mark by type.
 */
export const getMark = (editor: TEditor, type: string): any => {
  if (!editor) return;

  return Editor.marks(editor)?.[type];
};
