import { ReactEditor } from 'slate-react';

import type { TReactEditor } from '../types/TReactEditor';

/** Blur the editor. */
export const blurEditor = (editor: TReactEditor) =>
  ReactEditor.blur(editor as any);
