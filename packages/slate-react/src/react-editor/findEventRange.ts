import { ReactEditor } from 'slate-react';

import type { TReactEditor } from '../types/TReactEditor';

/** {@link ReactEditor.findEventRange} */
export const findEventRange = (editor: TReactEditor, event: any) => {
  try {
    return ReactEditor.findEventRange(editor as any, event);
  } catch (error) {}
};
