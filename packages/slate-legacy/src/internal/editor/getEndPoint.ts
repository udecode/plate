import { end } from 'slate';

import type { Editor } from '../../interfaces/editor/editor-type';
import type { EditorEndOptions } from '../../interfaces/index';
import type { At } from '../../types';

import { getAt } from '../../utils/getAt';

export const getEndPoint = (
  editor: Editor,
  at: At,
  options: EditorEndOptions = {}
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
