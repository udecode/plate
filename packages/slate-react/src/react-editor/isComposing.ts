import { ReactEditor } from 'slate-react';

import type { TReactEditor } from '../types/TReactEditor';

/** Check if the user is currently composing inside the editor. */
export const isComposing = (editor: TReactEditor) =>
  ReactEditor.isComposing(editor as any);
