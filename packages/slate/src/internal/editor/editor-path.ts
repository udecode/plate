import { type EditorPathOptions, path as pathBase } from 'slate';

import type { Editor } from '../../interfaces/editor/editor-type';
import type { At } from '../../types';

import { getAt } from '../../utils';

export const path = (editor: Editor, at: At, options?: EditorPathOptions) => {
  try {
    return pathBase(editor as any, getAt(editor, at)!, options as any);
  } catch {}
};
