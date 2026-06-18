import { start } from 'slate';

import type { Editor } from '../../interfaces/editor/editor-type';
import type { EditorStartOptions } from '../../interfaces/index';
import type { At } from '../../types';

import { getAt } from '../../utils';

export const getStartPoint = (
  editor: Editor,
  at: At,
  options: EditorStartOptions = {}
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
