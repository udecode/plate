import { DOMEditor } from 'slate-dom';

import type { TEditor } from '../editor';

export const isEditorReadOnly = (editor: TEditor) =>
  DOMEditor.isReadOnly(editor as any);
