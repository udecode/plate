import { setSelection as setSelectionBase } from 'slate';

import type { Editor, TRange } from '../../interfaces';

export const setSelection = (editor: Editor, props: Partial<TRange>) => {
  setSelectionBase(editor as any, props);
};
