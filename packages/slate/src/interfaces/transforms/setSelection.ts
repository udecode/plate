import { type Range, Transforms } from 'slate';

import type { TEditor } from '../editor/TEditor';

export const setSelection = (editor: TEditor, props: Partial<Range>) => {
  Transforms.setSelection(editor as any, props);
};
