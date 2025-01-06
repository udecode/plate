import { type EditorPathOptions, path } from 'slate';

import type { Editor } from '../../interfaces/editor/editor';
import type { At } from '../../types';

import { getAt } from '../../utils';

export const getPath = (
  editor: Editor,
  at: At,
  options?: EditorPathOptions
) => {
  try {
    return path(editor as any, getAt(editor, at)!, options as any);
  } catch {}
};
