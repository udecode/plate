import { DOMEditor } from 'slate-dom';

import type { Editor } from '../../interfaces/editor';

export const hasSelectableTarget = (
  editor: Editor,
  target: EventTarget | null
) => {
  try {
    return DOMEditor.hasSelectableTarget(editor as any, target);
  } catch {}

  return false;
};
