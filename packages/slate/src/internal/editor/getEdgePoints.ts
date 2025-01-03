import { edges } from 'slate';

import type { TEditor } from '../../interfaces/editor/TEditor';
import type { At } from '../../types/At';

import { getAt } from '../../utils/getAt';

export const getEdgePoints = (editor: TEditor, at: At) => {
  try {
    return edges(editor as any, getAt(editor, at)!);
  } catch {}
};
