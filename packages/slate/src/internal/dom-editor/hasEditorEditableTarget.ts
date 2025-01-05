import { DOMEditor } from 'slate-dom';

import type { TEditor } from '../../interfaces/editor';

export const hasEditorEditableTarget = (
  editor: TEditor,
  target: EventTarget | null
): target is Node => {
  try {
    return DOMEditor.hasEditableTarget(editor as any, target);
  } catch (error) {}

  return false;
};
