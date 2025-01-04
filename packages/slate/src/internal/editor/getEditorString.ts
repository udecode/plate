import { string } from 'slate';

import type { TEditor } from '../../interfaces/editor/TEditor';
import type { GetEditorStringOptions } from '../../interfaces/editor/editor-types';
import type { At } from '../../types/At';

import { getAt } from '../../utils/getAt';

export const getEditorString = (
  editor: TEditor,
  at: At | null = editor.selection,
  options?: GetEditorStringOptions
) => {
  if (!at) return '';

  try {
    return string(editor as any, getAt(editor, at)!, options);
  } catch {
    return '';
  }
};
