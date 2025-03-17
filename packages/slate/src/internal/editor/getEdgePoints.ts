import { edges } from 'slate';

import type { Editor } from '../../interfaces/editor/editor-type';
import type { At } from '../../types';

import { getAt } from '../../utils/getAt';

export const getEdgePoints = (editor: Editor, at: At) => {
  try {
    return edges(editor as any, getAt(editor, at)!);
  } catch {}
};
