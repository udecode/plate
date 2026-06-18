import { deleteBackward as deleteBackwardBase } from 'slate';

import type { Editor } from '../../interfaces/editor/editor-type';
import type { TextUnit } from '../../types';

export const deleteBackward = (
  editor: Editor,
  unit: TextUnit = 'character'
) => {
  deleteBackwardBase(editor as any, unit);
};
