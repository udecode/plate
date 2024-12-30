import { edges } from 'slate';

import type { At } from '../../types/At';
import type { TEditor } from './TEditor';

import { getAt } from '../../utils/getAt';

export const getEdgePoints = (editor: TEditor, at: At) => {
  try {
    return edges(editor as any, getAt(editor, at)!);
  } catch {}
};
