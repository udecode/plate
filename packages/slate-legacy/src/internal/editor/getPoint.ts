import { type EditorPointOptions, point } from 'slate';

import type { Editor } from '../../interfaces/editor/editor-type';
import type { At } from '../../types';

import { getAt } from '../../utils';

export const getPoint = (
  editor: Editor,
  at: At,
  options?: EditorPointOptions
) => {
  try {
    return point(editor as any, getAt(editor, at)!, options as any);
  } catch {}
};
