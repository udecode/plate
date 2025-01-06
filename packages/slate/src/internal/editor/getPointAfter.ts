import { after } from 'slate';

import type { Editor } from '../../interfaces/editor/editor';
import type { GetPointAfterOptions } from '../../interfaces/editor/editor-types';
import type { At } from '../../types';

import { getAt } from '../../utils';

export const getPointAfter = (
  editor: Editor,
  at: At,
  options?: GetPointAfterOptions
) => {
  try {
    return after(editor as any, getAt(editor, at)!, options as any);
  } catch {}
};
