import { DOMEditor } from 'slate-dom';

import type { TEditor } from '../editor';

export const hasEditorSelectableTarget = (
  editor: TEditor,
  target: EventTarget | null
) => {
  try {
    return DOMEditor.hasSelectableTarget(editor as any, target);
  } catch (error) {}

  return false;
};
