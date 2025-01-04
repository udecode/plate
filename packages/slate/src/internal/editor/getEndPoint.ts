import { end } from 'slate';

import type { TEditor } from '../../interfaces/editor/TEditor';
import type { GetEndPointOptions } from '../../interfaces/editor/editor-types';
import type { At } from '../../types/At';

import { getAt } from '../../utils/getAt';

export const getEndPoint = (
  editor: TEditor,
  at: At,
  options: GetEndPointOptions = {}
) => {
  try {
    if (options.previous) {
      const prevEntry = editor.api.previous({ at: getAt(editor, at)! });

      if (!prevEntry) return;

      return end(editor as any, prevEntry[1]);
    }

    return end(editor as any, getAt(editor, at)!);
  } catch {}
};
