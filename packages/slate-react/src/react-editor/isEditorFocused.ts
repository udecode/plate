import type { TEditor } from '@udecode/slate';

import { ReactEditor } from 'slate-react';

/** Check if the editor is focused. */
export const isEditorFocused = (editor: TEditor) =>
  ReactEditor.isFocused(editor as any);
