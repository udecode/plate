import { ReactEditor } from 'slate-react';

import type { TReactEditor } from '../types/TReactEditor';

/** Deselect the editor. */
export const deselectEditor = (editor: TReactEditor) =>
  ReactEditor.deselect(editor as any);
