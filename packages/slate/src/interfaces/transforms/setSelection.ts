import { type Range, Transforms } from 'slate';

import type { TEditor } from '../editor/TEditor';

/** Set new properties on the selection. */
export const setSelection = (editor: TEditor, props: Partial<Range>) => {
  Transforms.setSelection(editor as any, props);
};
