import { ReactEditor } from 'slate-react';

import type { TReactEditor } from '../types/TReactEditor';

/** Check if the editor is in read-only mode. */
export const isEditorReadOnly = (editor: TReactEditor) =>
  ReactEditor.isReadOnly(editor as any);
