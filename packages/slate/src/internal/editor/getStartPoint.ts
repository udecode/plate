import { start } from 'slate';

import type { TEditor } from '../../interfaces/editor/TEditor';
import type { GetStartPointOptions } from '../../interfaces/editor/editor-types';
import type { At } from '../../types';

import { getAt } from '../../utils';

export const getStartPoint = (
  editor: TEditor,
  at: At,
  options: GetStartPointOptions = {}
) => {
  try {
    if (options.next) {
      const nextEntry = editor.api.next({ at: getAt(editor, at)! });

      if (!nextEntry) return;

      return start(editor as any, nextEntry[1]);
    }

    return start(editor as any, getAt(editor, at)!);
  } catch {}
};
