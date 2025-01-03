import { end } from 'slate';

import type { At } from '../../types/At';
import type { TEditor } from '../../interfaces/editor/TEditor';

import { getAt } from '../../utils/getAt';

export const getEndPoint = (editor: TEditor, at: At) => {
  try {
    return end(editor as any, getAt(editor, at)!);
  } catch {}
};
