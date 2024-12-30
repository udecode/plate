import { Transforms } from 'slate';

import type { TEditor } from '../editor/TEditor';

export const deselect = (editor: TEditor) => {
  Transforms.deselect(editor as any);
};
