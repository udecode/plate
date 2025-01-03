import { before } from 'slate';

import type { TEditor } from '../../interfaces/editor/TEditor';
import type { GetPointBeforeOptions } from '../../interfaces/editor/editor-types';
import type { At } from '../../types';

import { getAt } from '../../utils';

export const getPointBefore = (
  editor: TEditor,
  at: At,
  options?: GetPointBeforeOptions
) => {
  try {
    return before(editor as any, getAt(editor, at)!, options as any);
  } catch {}
};
