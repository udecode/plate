import { string } from 'slate';

import type { TEditor } from '../../interfaces/editor/TEditor';
import type { GetEditorStringOptions } from '../../interfaces/editor/editor-types';
import type { At } from '../../types/At';

import { getAt } from '../../utils/getAt';

export const getEditorString = (
  editor: TEditor,
  at: At | null | undefined,
  options?: GetEditorStringOptions
) => {
  at = getAt(editor, at);

  if (!at) return '';

  try {
    return string(editor as any, at, options);
  } catch {
    return '';
  }
};
