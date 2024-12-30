import { Editor } from 'slate';

import type { At } from '../../types';
import type { TEditor } from './TEditor';

import { getAt } from '../../utils';

export const getStartPoint = (editor: TEditor, at: At) => {
  try {
    return Editor.start(editor as any, getAt(editor, at)!);
  } catch {}
};
