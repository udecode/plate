import { type Location, Transforms } from 'slate';

import type { TEditor } from '../editor/TEditor';

/** Set the selection to a new value. */
export const select = (editor: TEditor, target: Location) => {
  Transforms.select(editor as any, target);
};
