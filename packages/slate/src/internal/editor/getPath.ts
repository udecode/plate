import { type EditorPathOptions, path } from 'slate';

import type { TEditor } from '../../interfaces/editor/TEditor';
import type { At } from '../../types';

import { getAt } from '../../utils';

export const getPath = (
  editor: TEditor,
  at: At,
  options?: EditorPathOptions
) => {
  try {
    return path(editor as any, getAt(editor, at)!, options as any);
  } catch {}
};
