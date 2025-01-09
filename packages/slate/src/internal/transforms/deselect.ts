import { deselect as deselectBase } from 'slate';

import type { Editor } from '../../interfaces';

export const deselect = (editor: Editor) => {
  deselectBase(editor as any);
};
