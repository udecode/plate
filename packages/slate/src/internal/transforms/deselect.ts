import { deselect as deselectBase } from 'slate';

import type { TEditor } from '../../interfaces';

export const deselect = (editor: TEditor) => {
  deselectBase(editor as any);
};
