import { after } from 'slate';

import type { Editor } from '../../interfaces/editor/editor-type';
import type { EditorAfterOptions } from '../../interfaces/index';
import type { At } from '../../types';

import { getAt } from '../../utils';

export const getPointAfter = (
  editor: Editor,
  at: At,
  options?: EditorAfterOptions
) => {
  try {
    return after(editor as any, getAt(editor, at)!, options as any);
  } catch {}
};
