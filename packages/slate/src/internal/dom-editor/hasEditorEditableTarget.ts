import { DOMEditor } from 'slate-dom';

import type { Editor } from '../../interfaces/editor';

export const hasEditorEditableTarget = (
  editor: Editor,
  target: EventTarget | null
): target is Node => {
  try {
    return DOMEditor.hasEditableTarget(editor as any, target);
  } catch (error) {}

  return false;
};
