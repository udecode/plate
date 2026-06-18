import { string } from 'slate';

import type { Editor } from '../../interfaces/editor/editor-type';
import type { EditorStringOptions } from '../../interfaces/index';
import type { At } from '../../types';

import { getAt } from '../../utils/getAt';

export const getEditorString = (
  editor: Editor,
  at: At | null = editor.selection,
  options?: EditorStringOptions
) => {
  if (!at) return '';

  try {
    return string(editor as any, getAt(editor, at)!, options);
  } catch {
    return '';
  }
};
