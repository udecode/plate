import { deselect as deselectBase } from 'slate';

import type { TEditor } from '../editor/TEditor';

export const deselect = (editor: TEditor) => {
  deselectBase(editor as any);
};
