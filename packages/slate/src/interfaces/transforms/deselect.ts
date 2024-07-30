import { Transforms } from 'slate';

import type { TEditor } from '../editor/TEditor';

/** Unset the selection. */
export const deselect = (editor: TEditor) => {
  Transforms.deselect(editor as any);
};
