import { after } from 'slate';

import type { TEditor } from '../../interfaces/editor/TEditor';
import type { GetPointAfterOptions } from '../../interfaces/editor/editor-types';
import type { At } from '../../types';

import { getAt } from '../../utils';

export const getPointAfter = (
  editor: TEditor,
  at: At,
  options?: GetPointAfterOptions
) => {
  try {
    return after(editor as any, getAt(editor, at)!, options as any);
  } catch {}
};
