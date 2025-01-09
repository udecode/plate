import { deleteForward as deleteForwardBase } from 'slate';

import type { Editor } from '../../interfaces/editor/editor-type';
import type { TextUnit } from '../../types';

export const deleteForward = (editor: Editor, unit: TextUnit = 'character') => {
  deleteForwardBase(editor as any, unit);
};
