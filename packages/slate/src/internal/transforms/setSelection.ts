import { type Range, setSelection as setSelectionBase } from 'slate';

import type { TEditor } from '../../interfaces';

export const setSelection = (editor: TEditor, props: Partial<Range>) => {
  setSelectionBase(editor as any, props);
};
