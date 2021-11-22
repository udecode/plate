import { Editor } from 'slate';
import { TEditor } from '../../types/slate/TEditor';

/**
 * Get selected mark by type.
 */
export const getMark = (editor: TEditor, type: string): any => {
  if (!editor) return;

  return Editor.marks(editor)?.[type];
};
