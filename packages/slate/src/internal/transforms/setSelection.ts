import { type Range, setSelection as setSelectionBase } from 'slate';

import type { Editor } from '../../interfaces';

export const setSelection = (editor: Editor, props: Partial<Range>) => {
  setSelectionBase(editor as any, props);
};
