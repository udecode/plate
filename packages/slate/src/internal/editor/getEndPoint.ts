import { end } from 'slate';

import type { TEditor } from '../../interfaces/editor/TEditor';
import type { At } from '../../types/At';

import { getAt } from '../../utils/getAt';

export const getEndPoint = (editor: TEditor, at: At) => {
  try {
    return end(editor as any, getAt(editor, at)!);
  } catch {}
};
