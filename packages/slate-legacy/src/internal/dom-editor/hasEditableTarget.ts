import { DOMEditor } from 'slate-dom';

import type { Editor } from '../../interfaces/editor';

export const hasEditableTarget = (
  editor: Editor,
  target: EventTarget | null
): target is Node => {
  try {
    return DOMEditor.hasEditableTarget(editor as any, target);
  } catch {}

  return false;
};
