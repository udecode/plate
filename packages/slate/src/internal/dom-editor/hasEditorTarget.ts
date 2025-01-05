import { DOMEditor } from 'slate-dom';

import type { TEditor } from '../../interfaces/editor';

export const hasEditorTarget = (
  editor: TEditor,
  target: EventTarget | null
): target is Node => {
  try {
    return DOMEditor.hasTarget(editor as any, target);
  } catch (error) {}

  return false;
};
