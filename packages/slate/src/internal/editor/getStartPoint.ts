import { start } from 'slate';

import type { TEditor } from '../../interfaces/editor/TEditor';
import type { At } from '../../types';

import { getAt } from '../../utils';

export const getStartPoint = (editor: TEditor, at: At) => {
  try {
    return start(editor as any, getAt(editor, at)!);
  } catch {}
};
