import { Editor } from 'slate';

import type { At } from '../../types/At';
import type { TEditor } from './TEditor';

import { getAt } from '../../utils/getAt';

export const getEdgePoints = (editor: TEditor, at: At) => {
  try {
    return Editor.edges(editor as any, getAt(editor, at)!);
  } catch {}
};
